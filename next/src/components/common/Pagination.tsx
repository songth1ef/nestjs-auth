import { Dispatch, SetStateAction } from 'react';
import { PageMeta } from '@/lib/api/client';

interface PaginationProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  meta: PageMeta;
  labels: {
    showing: string;
    to: string;
    of: string;
    results: string;
    previous: string;
    next: string;
    first: string;
    last: string;
  };
}

export default function Pagination({ page, setPage, meta, labels }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* 移动端分页控件 */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => setPage(page - 1)}
          disabled={!meta.hasPreviousPage}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            meta.hasPreviousPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {labels.previous}
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!meta.hasNextPage}
          className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
            meta.hasNextPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {labels.next}
        </button>
      </div>

      {/* 桌面端分页控件 */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {labels.showing}{' '}
            <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span>
            {' '}{labels.to}{' '}
            <span className="font-medium">
              {Math.min(meta.page * meta.limit, meta.totalItems)}
            </span>
            {' '}{labels.of}{' '}
            <span className="font-medium">{meta.totalItems}</span>
            {' '}{labels.results}
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
            {/* 第一页按钮 */}
            <button
              onClick={() => setPage(1)}
              disabled={!meta.hasPreviousPage || meta.page === 1}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasPreviousPage && meta.page !== 1
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.first}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
              </svg>
            </button>
            
            {/* 上一页按钮 */}
            <button
              onClick={() => setPage(page - 1)}
              disabled={!meta.hasPreviousPage}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasPreviousPage
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.previous}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* 页码按钮 */}
            {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
              const pageNum = meta.page <= 3
                ? i + 1
                : meta.page >= meta.totalPages - 2
                  ? meta.totalPages - 4 + i
                  : meta.page - 2 + i;

              if (pageNum <= 0 || pageNum > meta.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    meta.page === pageNum
                      ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* 下一页按钮 */}
            <button
              onClick={() => setPage(page + 1)}
              disabled={!meta.hasNextPage}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasNextPage
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.next}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* 最后一页按钮 */}
            <button
              onClick={() => setPage(meta.totalPages)}
              disabled={!meta.hasNextPage || meta.page === meta.totalPages}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 ${
                meta.hasNextPage && meta.page !== meta.totalPages
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.last}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
} 