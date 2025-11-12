import { useEffect } from 'react';
import { useContactStore, type ContactType } from '@/store/contactStore.ts';
import Table, { type TableColumn } from '@/components/ui/Table';

export default function ContactPage() {
  const { contacts, loading, error, fetchContacts, deleteContact } = useContactStore();

  useEffect(() => {
    fetchContacts().then((r) => console.log(r));
  }, [fetchContacts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This will affect all assets in this category.')) {
      try {
        await deleteContact(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const openEmail = (email: string) => {
    window.open(
      `mailto:${email}?subject=Follow up from Copay au&body=Thank you for your message`,
      '_blank'
    );
  };

  const columns: TableColumn<ContactType>[] = [
    {
      title: 'Submitted by',
      key: 'submitted_by',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-slate-900">{row.name}</div>
            <div
              onClick={() => openEmail(row.email)}
              className="text-sm text-blue-600 cursor-pointer"
            >
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Message',
      key: 'message',
      minWidth: '300px',
      maxWidth: '500px',
      render: (_, row) => (
        <div className="max-w-xl text-sm text-slate-600">{row.message || 'No description'}</div>
      ),
    },
    {
      title: 'Phone Number',
      key: 'phone_number',
      sortable: false,
      render: (_, row) => <div>{row.phone_number || 'Not added'}</div>,
    },
    {
      title: 'location',
      key: 'location',
      sortable: true,
      align: 'center',
      render: (value) => <div>{value || 'Not added'}</div>,
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.id && handleDelete(row.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contacts received</h2>
          <p className="text-slate-600 mt-1">Information collected from contact form.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Table */}
      <Table
        data={contacts}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search contacts..."
        pagination={{
          enabled: true,
          pageSize: 10,
        }}
        maxHeight="600px" // 🔥 NEW: Vertical scroll
        stickyHeader
        hoverable
      />

      {/* Category Form Modal */}
    </div>
  );
}
