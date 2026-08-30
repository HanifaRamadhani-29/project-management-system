import { Link } from '@inertiajs/react';

interface LinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkType[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null; // Only Previous, 1, Next

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-8">
            {links.map((link, index) => {
                const isPrevious = link.label.includes('Previous');
                const isNext = link.label.includes('Next');
                
                let label = link.label;
                if (isPrevious) label = '←';
                if (isNext) label = '→';

                if (!link.url) {
                    return (
                        <div
                            key={index}
                            className="px-3 py-2 text-sm text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed bg-slate-50"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                            link.active
                                ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
