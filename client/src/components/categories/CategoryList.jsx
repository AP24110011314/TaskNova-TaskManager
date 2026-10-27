import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import ConfirmDialog from '../common/ConfirmDialog'
import Modal from '../common/Modal'
import CategoryForm from './CategoryForm'

export default function CategoryList() {
  const { categories, createCategory, updateCategory, deleteCategory, refreshStats } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const handleFormSubmit = async (data) => {
    if (editingCategory) {
      await updateCategory(editingCategory._id, data)
    } else {
      await createCategory(data)
    }
    refreshStats()
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete._id)
      refreshStats()
    }
    setShowDeleteConfirm(false)
    setCategoryToDelete(null)
  }

  const openNewForm = () => {
    setEditingCategory(null)
    setFormData({ name: '', color: '#3b82f6' })
    setError('')
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize your tasks into color-coded categories
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <svg className="w-4 h-4 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="5" y2="19"/>
            <line x1="5" x2="19" y1="12" y2="12"/>
          </svg>
          New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" x2="7.01" y1="7" y2="7"/>
          </svg>
          <p className="text-slate-600 font-medium">No categories yet</p>
          <p className="text-sm text-slate-400 mb-4">Create your first category to organize your tasks.</p>
          <button
            onClick={openNewForm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {categories.map(category => (
              <div key={category._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-white"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">{category.taskCount || 0} task{(category.taskCount !== 1) ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    aria-label={`Edit ${category.name}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    aria-label={`Delete ${category.name}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingCategory(null)
          }}
          title={editingCategory ? 'Edit Category' : 'New Category'}
          size="sm"
        >
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingCategory(null)
            }}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setCategoryToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${categoryToDelete?.name}"? Any associated tasks will remain intact and become uncategorized.`}
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  )
}