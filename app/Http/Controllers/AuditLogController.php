<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Check if the current user is authorized as Super Admin.
     */
    protected function authorizeSuperAdmin(): void
    {
        $user = auth()->user();
        if (!$user || !($user->role === 'super_admin' || $user->hasRole('Super Admin'))) {
            abort(403, 'Unauthorized action. Only Super Admins are allowed to view audit logs.');
        }
    }

    /**
     * Display a listing of system-wide audit logs.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        if ($user->role !== 'super_admin' && !$user->can('audit_logs.view')) {
            abort(403, 'Unauthorized action. You do not have permission to view audit logs.');
        }

        $query = AuditLog::with('user:id,name,email')
            ->latest('created_at');

        // Apply Action Type filter
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Apply Actor User filter
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Apply Date Range filters
        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        // Apply Keyword Search (IP, user name/email, action type)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $auditLogs = $query->paginate(15)->withQueryString();

        // Get filter options (unique actions and all users)
        $actionOptions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->toArray();

        $userOptions = User::orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('AuditLogs/Index', [
            'auditLogs' => $auditLogs,
            'filters' => $request->only(['action', 'user_id', 'date_start', 'date_end', 'search']),
            'actionOptions' => $actionOptions,
            'userOptions' => $userOptions,
        ]);
    }
}
