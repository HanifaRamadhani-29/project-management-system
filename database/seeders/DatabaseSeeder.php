<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Jalankan Seeder Permissions dulu jika ada
        $this->call([
            PermissionSeeder::class,
        ]);

        // 2. Buat Akun Super Admin (LENGKAP DENGAN USERNAME)
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin', // <-- Tambahkan ini!
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // 3. Buat Akun Project Manager
        User::firstOrCreate(
            ['email' => 'pm@example.com'],
            [
                'name' => 'Project Manager',
                'username' => 'pm_lead',
                'password' => Hash::make('password'),
                'role' => 'project_manager',
                'email_verified_at' => now(),
            ]
        );

        // 4. Buat Akun Team Member
        User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Team Member',
                'username' => 'member_dev',
                'password' => Hash::make('password'),
                'role' => 'member',
                'email_verified_at' => now(),
            ]
        );

        // 5. Buat Akun Viewer / Client
        User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            [
                'name' => 'Viewer Client',
                'username' => 'viewer_client',
                'password' => Hash::make('password'),
                'role' => 'viewer',
                'email_verified_at' => now(),
            ]
        );
    }
}
