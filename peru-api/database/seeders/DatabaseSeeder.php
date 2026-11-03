<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        Book::firstOrCreate(
            ['title' => 'Bumi Manusia', 'author' => 'Pramoedya Ananta Toer'],
            ['year' => 1980],
        );
        Book::firstOrCreate(
            ['title' => 'Laskar Pelangi', 'author' => 'Andrea Hirata'],
            ['year' => 2005],
        );
        Book::firstOrCreate(
            ['title' => 'Negeri 5 Menara', 'author' => 'Ahmad Fuadi'],
            ['year' => 2009],
        );
        Book::firstOrCreate(
            ['title' => 'Pride and Prejudice', 'author' => 'Jane Austen'],
            ['year' => 1813],
        );

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
