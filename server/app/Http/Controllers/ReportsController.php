<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function collection()
    {
        // 📊 1. Donut chart: Count materials per type (from book_copies)
        $materialsByType = DB::table('book_copies')
            ->select('material_type', DB::raw('COUNT(*) as total'))
            ->whereNotNull('material_type')
            ->groupBy('material_type')
            ->get();

        // 📈 2. Line chart: Books added per month (from books)
        $booksPerMonth = DB::table('books')
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('COUNT(*) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 🥧 3. Pie chart: Sources (from book_copies)
        $sources = DB::table('book_copies')
            ->select('source', DB::raw('COUNT(*) as total'))
            ->whereNotNull('source')
            ->groupBy('source')
            ->get();

        // 📚 4. Bar chart: Books per category (from books)
        $ddcCategories = [
            '000' => 'Technology',
            '100' => 'Religion',
            '200' => 'Philosophy',
            '300' => 'General Works',
            '400' => 'Arts',
            '500' => 'Languages',
            '600' => 'Literature',
            '700' => 'Social Sciences',
            '800' => 'Science',
            '900' => 'History and geography',
        ];

        $booksByCategory = DB::table('book_copies')
            ->join('books', 'book_copies.book_id', '=', 'books.id')
            ->select('books.dewey_decimal', DB::raw('COUNT(book_copies.id) as total'))
            ->groupBy('books.dewey_decimal')
            ->get()
            ->map(function ($item) use ($ddcCategories) {
                $code = str_pad($item->dewey_decimal, 3, '0', STR_PAD_LEFT);
                $key = substr($code, 0, 1) . '00';
                return [
                    'category' => $ddcCategories[$key] ?? 'Other',
                    'total' => $item->total,
                ];
            })
            ->groupBy('category')
            ->map(function ($group) {
                return [
                    'category' => $group[0]['category'],
                    'total' => array_sum(array_column($group->toArray(), 'total')),
                ];
            })
            ->values();

        // 🧾 5. Collection Overview Summary
        $totalCopies = DB::table('book_copies')->count();

        // Count total borrowed per material type (circulation status = borrowed)
        $borrowedByType = DB::table('circulations')
            ->join('book_copies', 'circulations.book_copy_id', '=', 'book_copies.id')
            ->select('book_copies.material_type', DB::raw('COUNT(*) as borrowed_total'))
            ->where('circulations.status', 'borrowed')
            ->groupBy('book_copies.material_type')
            ->pluck('borrowed_total', 'book_copies.material_type');

        $collectionOverview = $materialsByType->map(function ($item) use ($totalCopies, $borrowedByType) {
            $active = $borrowedByType[$item->material_type] ?? 0;
            return [
                'material_type' => $item->material_type,
                'total' => $item->total,
                'percent_of_total' => $totalCopies > 0
                    ? round(($item->total / $totalCopies) * 100, 2)
                    : 0,
                'percent_active' => $item->total > 0
                    ? round(($active / $item->total) * 100, 2)
                    : 0,
            ];
        });

        return response()->json([
            'materialsByType' => $materialsByType,
            'booksPerMonth' => $booksPerMonth,
            'sources' => $sources,
            'booksByCategory' => $booksByCategory,
            'collectionOverview' => $collectionOverview,
        ]);
    }

    public function collectionMasterlist()
    {
        $copies = \App\Models\BookCopy::with('book')->get();
        return response()->json($copies);
    }


    // for the circulation report
    public function circulation()
    {
        // get current fine per day
        $finePerDay = (int) \App\Models\LibrarySetting::getValue('fine_per_day', 5);

        // We'll return last 12 months (including current)
        $months = [];
        $now = Carbon::now();
        for ($i = 11; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $months[] = [
                'label' => $m->format('Y-m'),    // e.g. 2025-10
                'display' => $m->format('M Y'),  // e.g. Oct 2025
                'year' => (int)$m->format('Y'),
                'month' => (int)$m->format('n'),
            ];
        }

        $rows = [];
        $totals = [
            'borrowed' => 0,
            'returned' => 0,
            'renewed' => 0,
            'overdue' => 0,
            'fines' => 0.0,
        ];

        foreach ($months as $m) {
            $y = $m['year'];
            $mo = $m['month'];

            // Borrowed = circulations issued in that month
            $borrowed = DB::table('circulations')
                ->whereYear('issue_date', $y)
                ->whereMonth('issue_date', $mo)
                ->count();

            // Returned = circulations returned in that month
            $returned = DB::table('circulations')
                ->whereNotNull('date_returned')
                ->whereYear('date_returned', $y)
                ->whereMonth('date_returned', $mo)
                ->count();

            // Renewed = circulations with renewal_date in that month
            $renewed = DB::table('circulations')
                ->whereNotNull('renewal_date')
                ->whereYear('renewal_date', $y)
                ->whereMonth('renewal_date', $mo)
                ->count();

            // Overdue:
            $currentlyOverdue = DB::table('circulations')
                ->where('status', 'borrowed')
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $mo)
                ->where('due_date', '<', now())
                ->count();

            $returnedOverdue = DB::table('circulations')
                ->whereNotNull('date_returned')
                ->whereYear('date_returned', $y)
                ->whereMonth('date_returned', $mo)
                ->whereRaw('date_returned > due_date')
                ->count();

            $overdue = $currentlyOverdue + $returnedOverdue;

            // Fines: calculate dynamically
            $finesSum = DB::table('circulations')
                ->select(DB::raw("
                    SUM(
                        CASE 
                            WHEN date_returned IS NOT NULL AND date_returned > due_date 
                                THEN DATEDIFF(date_returned, due_date) * $finePerDay
                            WHEN date_returned IS NULL AND due_date < NOW()
                                THEN DATEDIFF(NOW(), due_date) * $finePerDay
                            ELSE 0
                        END
                    ) as total_fines
                "))
                ->whereYear('due_date', $y)
                ->whereMonth('due_date', $mo)
                ->value('total_fines');


            $finesSum = (float) $finesSum;


            // Add to totals
            $totals['borrowed'] += $borrowed;
            $totals['returned'] += $returned;
            $totals['renewed'] += $renewed;
            $totals['overdue'] += $overdue;
            $totals['fines'] += $finesSum;

            $rows[] = [
                'month' => $m['display'],
                'year_month' => $m['label'],
                'borrowed' => (int)$borrowed,
                'returned' => (int)$returned,
                'renewed' => (int)$renewed,
                'overdue' => (int)$overdue,
                'fines' => $finesSum,
            ];
        }

        // summary
        $summary = [
            'borrowed' => $totals['borrowed'],
            'returned' => $totals['returned'],
            'renewed' => $totals['renewed'],
            'overdue' => $totals['overdue'],
            'fines' => $totals['fines'],
        ];

        return response()->json([
            'rows' => $rows,
            'summary' => $summary,
        ]);
    }

}
