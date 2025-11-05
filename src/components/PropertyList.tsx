import type { Property } from '../types/property.types';
import { AiFillTablet } from 'react-icons/ai';
import Table from '@/components/ui/Table.tsx';

interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

export default function PropertyList({ properties, loading, onEdit, onDelete }: PropertyListProps) {
  const propertiesHeader = [
    {
      title: 'Property',
      key: 'property',
    },
    {
      title: 'Location',
      key: 'location',
    },
    {
      title: 'Price',
      key: 'price',
    },
    {
      title: 'Details',
      key: 'details',
    },
    {
      title: 'Status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
    },
  ];
  const columns: TableColumn[] = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Length', key: 'length' },
    {
      title: 'Year',
      key: 'year',
      sortable: true,
      align: 'center',
    },
    {
      title: 'Price',
      key: 'price',
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No properties found</h3>
          <p className="mt-2 text-sm text-slate-500">
            Get started by creating your first property.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-slate-100 text-slate-800',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className=" rounded-xl  border-slate-200">
      {/* Desktop View */}
      <div className="hidden p-2 lg:block overflow-x-auto">
        <Table
          data={properties}
          columns={propertiesHeader}
          searchable
          pagination={{ enabled: false }}
          striped
          hoverable
          bordered
        />{' '}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden divide-y divide-slate-200">
        {properties.map((property) => (
          <div key={property.id} className="p-4">
            <div className="flex space-x-3">
              {property.feature_image ? (
                <img
                  src={property.feature_image}
                  alt={property.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 truncate">{property.title}</h3>
                    <p className="text-sm text-slate-500">{property.propertyType}</p>
                  </div>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(property.status)}`}
                  >
                    {property.status}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-600">
                    {property.state}, {property.country}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    ${property.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <span>{property.bedrooms} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} baths</span>
                  </div>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => onEdit(property)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => property.id && onDelete(property.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
