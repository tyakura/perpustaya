<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $book = Book::create($validated);

        return response()->json($book, 201);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        return Book::query()
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%");
                });
            })
            ->orderBy('title')
            ->paginate(12)
            ->withQueryString();
    }

    public function show(Book $book)
    {
        return $book;
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'author' => ['sometimes', 'required', 'string', 'max:255'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $book->update($validated);

        return response()->json($book->refresh());
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->noContent();
    }
}
