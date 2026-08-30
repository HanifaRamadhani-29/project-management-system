<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    /**
     * Check if current user is authorized as Super Admin.
     */
    protected function authorizeSuperAdmin(): void
    {
        $user = auth()->user();
        if (!$user) {
            abort(403, 'Unauthenticated.');
        }

        $isSuperAdmin = $user->role === 'super_admin' 
            || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin())
            || (method_exists($user, 'hasRole') && ($user->hasRole('super_admin') || $user->hasRole('Super Admin')));

        if (!$isSuperAdmin) {
            abort(403, 'Unauthorized action. Only Super Admins can access this resource.');
        }
    }

    /**
     * Display the roles and permissions matrix.
     */
    public function index(): Response
    {
        $this->authorizeSuperAdmin();

        // Load roles with their assigned permissions
        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permission_names' => $role->permissions->pluck('name')->toArray(),
            ];
        });

        // Load all permissions grouped by module/group
        $permissions = Permission::all()->groupBy('module')->map(function ($items, $module) {
            return $items->map(function ($perm) {
                return [
                    'id' => $perm->id,
                    'name' => $perm->name,
                    'description' => $perm->description,
                ];
            });
        });

        return Inertia::render('Roles/Permissions', [
            'roles' => $roles,
            'permissions_grouped' => $permissions,
        ]);
    }

    /**
     * Update permissions matrix for roles.
     */
    public function update(Request $request): mixed
    {
        $this->authorizeSuperAdmin();

        if ($request->has('role')) {
            // Guard lockout
            if ($request->role === 'Super Admin') {
                return redirect()->route('roles.permissions.index')->with('error', 'Super Admin permissions cannot be modified.');
            }

            $role = \Spatie\Permission\Models\Role::findByName($request->role);
            if ($role) {
                $role->syncPermissions($request->permissions ?? []);
            }
            
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions(); // Reset cache permission
            return redirect()->route('roles.permissions.index')->with('success', 'Permissions updated');
        }

        // Support matrix format for tests
        if ($request->has('matrix')) {
            $matrix = $request->input('matrix');

            foreach ($matrix as $roleName => $permissionNames) {
                if ($roleName === 'Super Admin') {
                    continue;
                }

                $role = Role::where('name', $roleName)->first();
                if ($role) {
                    $role->syncPermissions($permissionNames ?? []);
                }
            }

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return redirect()->route('roles.permissions.index')->with('success', 'Permissions updated');
        }

        return redirect()->route('roles.permissions.index')->with('error', 'Invalid payload.');
    }
}
