<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Check if current user is authorized as Super Admin.
     */
    protected function authorizeSuperAdmin(): void
    {
        $user = auth()->user();
        if (!$user || !($user->role === 'super_admin' || $user->hasRole('Super Admin'))) {
            abort(403, 'Unauthorized action. Only Super Admins can access this resource.');
        }
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        $query = User::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserStoreRequest $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'],
        ]);

        // Sync Spatie role
        $this->syncSpatieRole($user, $validated['role']);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validated();
        $currentUser = auth()->user();

        // Safety lock: Super Admin cannot demote themselves
        if ($user->id === $currentUser->id && $validated['role'] !== 'super_admin') {
            return redirect()->back()->withErrors([
                'role' => 'Self-demotion lock active. You cannot demote yourself from Super Admin.'
            ]);
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        // Sync Spatie role
        $this->syncSpatieRole($user, $validated['role']);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $currentUser = auth()->user();

        // Safety lock: Super Admin cannot delete themselves
        if ($user->id === $currentUser->id) {
            abort(403, 'Self-destruction lock active. You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Reset password for the specified user.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update([
            'password' => bcrypt($validated['password']),
        ]);

        return redirect()->route('users.index')->with('success', 'Password reset successfully.');
    }

    /**
     * Sync database enum role with Spatie permission roles.
     */
    protected function syncSpatieRole(User $user, string $role): void
    {
        $spatieRole = match ($role) {
            'super_admin' => 'Super Admin',
            'project_manager' => 'Project Manager',
            'member' => 'Member',
            'viewer' => 'Viewer',
            default => null,
        };

        if ($spatieRole) {
            $user->syncRoles($spatieRole);
        }
    }
}
