import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import http from 'http'
import app from '../app.js'
import Category from '../models/Category.js'
import Task from '../models/Task.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-todo'

describe('TaskNova API Tests', () => {
  let server
  let baseUrl
  let testCategoryId
  let testTaskId
  const testClientId = 'test-client-' + Date.now()

  before(async () => {
    await mongoose.connect(MONGO_URI)
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}/api`
  })

  after(async () => {
    // Clean up test items
    if (testCategoryId) {
      await Category.findByIdAndDelete(testCategoryId)
    }
    await Task.deleteMany({ clientId: testClientId })
    await new Promise((resolve) => server.close(resolve))
    await mongoose.disconnect()
  })

  test('GET /api/health should return ok', async () => {
    const res = await fetch(`${baseUrl}/health`)
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.status, 'ok')
  })

  test('GET /api/categories returns categories with taskCount', async () => {
    const res = await fetch(`${baseUrl}/categories`)
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(Array.isArray(json.data))
    if (json.data.length > 0) {
      assert.ok('taskCount' in json.data[0])
    }
  })

  test('POST /api/categories creates a category', async () => {
    const uniqueName = 'TestCat-' + Date.now()
    const res = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, color: '#3b82f6' })
    })
    assert.strictEqual(res.status, 201)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.name, uniqueName)
    testCategoryId = json.data._id

    // Test duplicate name returns 409
    const dupRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: uniqueName, color: '#ef4444' })
    })
    assert.strictEqual(dupRes.status, 409)
  })

  test('PUT /api/categories/:id updates category', async () => {
    const updatedName = 'TestCat-Updated-' + Date.now()
    const res = await fetch(`${baseUrl}/categories/${testCategoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updatedName, color: '#10b981' })
    })
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.name, updatedName)
  })

  test('POST /api/tasks creates a task with nullable category and dueDate', async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: testClientId,
        title: 'Automated test task',
        description: 'Testing task creation with nullable category',
        category: testCategoryId,
        priority: 'high',
        status: 'todo',
        dueDate: null,
        tags: ['test', 'automated']
      })
    })
    assert.strictEqual(res.status, 201)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.title, 'Automated test task')
    assert.strictEqual(json.data.clientId, testClientId)
    assert.strictEqual(typeof json.data.isOverdue, 'boolean')
    testTaskId = json.data._id
  })

  test('POST /api/tasks with existing clientId is idempotent (returns 200 and existing task)', async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: testClientId,
        title: 'Duplicate client task',
        priority: 'urgent'
      })
    })
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data._id, testTaskId)
  })

  test('GET /api/tasks returns paginated task list with isOverdue computed', async () => {
    const res = await fetch(`${baseUrl}/tasks?limit=5`)
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(Array.isArray(json.data))
    assert.ok('meta' in json)
    assert.strictEqual(json.meta.limit, 5)
    if (json.data.length > 0) {
      assert.strictEqual(typeof json.data[0].isOverdue, 'boolean')
    }
  })

  test('GET /api/tasks filters by priority, search, and group', async () => {
    const resPriority = await fetch(`${baseUrl}/tasks?priority=high,urgent`)
    assert.strictEqual(resPriority.status, 200)
    const jsonPriority = await resPriority.json()
    assert.ok(jsonPriority.data.every(t => ['high', 'urgent'].includes(t.priority)))

    const resSearch = await fetch(`${baseUrl}/tasks?q=Automated`)
    assert.strictEqual(resSearch.status, 200)
    const jsonSearch = await resSearch.json()
    assert.ok(jsonSearch.data.some(t => t._id === testTaskId))

    const resGroup = await fetch(`${baseUrl}/tasks?group=nodate`)
    assert.strictEqual(resGroup.status, 200)
    const jsonGroup = await resGroup.json()
    assert.ok(jsonGroup.data.every(t => !t.dueDate))
  })

  test('PATCH /api/tasks/:id/status updates status and sets completedAt', async () => {
    const res = await fetch(`${baseUrl}/tasks/${testTaskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    })
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.status, 'done')
    assert.ok(json.data.completedAt !== null)
  })

  test('GET /api/stats returns complete statistics aggregation', async () => {
    const res = await fetch(`${baseUrl}/stats`)
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    const stats = json.data
    assert.ok('total' in stats)
    assert.ok('completed' in stats)
    assert.ok('completionRate' in stats)
    assert.ok('overdue' in stats)
    assert.ok('byPriority' in stats)
    assert.ok('byStatus' in stats)
    assert.ok('byCategory' in stats)
    assert.ok('groups' in stats)
  })

  test('DELETE /api/categories/:id deletes category and unassigns tasks', async () => {
    const res = await fetch(`${baseUrl}/categories/${testCategoryId}`, {
      method: 'DELETE'
    })
    assert.strictEqual(res.status, 200)
    testCategoryId = null

    // Check task category is now null
    const taskRes = await fetch(`${baseUrl}/tasks/${testTaskId}`)
    assert.strictEqual(taskRes.status, 200)
    const taskJson = await taskRes.json()
    assert.strictEqual(taskJson.data.category, null)
  })

  test('DELETE /api/tasks?status=done bulk clears done tasks', async () => {
    const res = await fetch(`${baseUrl}/tasks?status=done`, {
      method: 'DELETE'
    })
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok('deletedCount' in json.data)
  })

  test('404 for unknown endpoints', async () => {
    const res = await fetch(`${baseUrl}/nonexistent`)
    assert.strictEqual(res.status, 404)
    const json = await res.json()
    assert.strictEqual(json.success, false)
    assert.ok('error' in json)
  })
})
