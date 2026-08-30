<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorize in controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:backlog,todo,in_progress,review,done'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'reporter_id' => ['nullable', 'exists:users,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'deadline' => ['nullable', 'date'],
            'order' => ['nullable', 'integer'],
        ];
    }
}
