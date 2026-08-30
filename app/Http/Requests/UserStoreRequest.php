<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Enforce Super Admin authorization check (failsafe)
        $user = auth()->user();
        return $user && ($user->role === 'super_admin' || $user->hasRole('Super Admin'));
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
<<<<<<< HEAD
=======
            'username' => ['required', 'string', 'max:50', 'unique:users,username', 'alpha_dash'],
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:super_admin,project_manager,member,viewer'],
        ];
    }
}
