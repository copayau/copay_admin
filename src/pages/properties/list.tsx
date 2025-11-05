import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ErrorBoundary from '@/components/ErrorBoundary';
import SimpleTable from '@/components/Properties/SimpleTable';

export default function AddNewPropertyPage() {
  return (
    <>
      <main className="mx-auto mb-3 w-full shadow-none  sm:w-full sm:shadow-xl">
        <div className="p-4">
          <ErrorBoundary>
            <SimpleTable />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </>
  );
}

export const metadata = {
  title: 'Add New Property | CoPay',
  description: 'Add a new property to the CoPay platform. Submit your property details and images.',
  keywords: 'add property, property listing, real estate, CoPay, property management',
  openGraph: {
    title: 'Add New Property | CoPay',
    description: 'Add a new property to the CoPay platform.',
    images: ['/og-image.jpg'],
    url: 'https://copay.au/add-new-property',
    siteName: 'CoPay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add New Property | CoPay',
    description: 'Add a new property to the CoPay platform.',
    images: ['/og-image.jpg'],
  },
  canonical: 'https://copay.au/add-new-property',
  robots: {
    index: true,
    follow: true,
  },
};
