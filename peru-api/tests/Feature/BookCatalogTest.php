<?php

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the catalog returns books ordered by title', function () {
    Book::create(['title' => 'Zola', 'author' => 'Author Z', 'year' => 1990]);
    Book::create(['title' => 'A Novel', 'author' => 'Author A', 'year' => 2000]);

    $this->getJson('/api/books')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'A Novel')
        ->assertJsonPath('data.1.title', 'Zola');
});

test('the catalog search matches titles and authors', function () {
    Book::create(['title' => 'Novel One', 'author' => 'Writer Search', 'year' => 2000]);
    Book::create(['title' => 'Search Story', 'author' => 'Writer Two', 'year' => 2001]);
    Book::create(['title' => 'Other Book', 'author' => 'Writer Three', 'year' => 2002]);

    $this->getJson('/api/books?search=Search')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('total', 2);
});

test('a book can be opened by id', function () {
    $book = Book::create([
        'title' => 'A Novel',
        'author' => 'Writer A',
        'year' => null,
    ]);

    $this->getJson("/api/books/{$book->id}")
        ->assertOk()
        ->assertJsonPath('title', 'A Novel')
        ->assertJsonPath('year', null);
});

test('a book can be added to the catalog', function () {
    $this->postJson('/api/books', [
        'title' => 'New Book',
        'author' => 'New Author',
        'year' => 2024,
    ])
        ->assertCreated()
        ->assertJsonPath('title', 'New Book')
        ->assertJsonPath('author', 'New Author')
        ->assertJsonPath('year', 2024);

    $this->assertDatabaseHas('books', ['title' => 'New Book']);
});

test('a book can be edited in the catalog', function () {
    $book = Book::create([
        'title' => 'Old Title',
        'author' => 'Old Author',
        'year' => 2000,
    ]);

    $this->putJson("/api/books/{$book->id}", [
        'title' => 'Updated Title',
        'author' => 'Updated Author',
        'year' => 2024,
    ])
        ->assertOk()
        ->assertJsonPath('title', 'Updated Title')
        ->assertJsonPath('author', 'Updated Author')
        ->assertJsonPath('year', 2024);

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
        'title' => 'Updated Title',
    ]);
});

test('a book can be deleted from the catalog', function () {
    $book = Book::create([
        'title' => 'Book to Delete',
        'author' => 'Writer A',
        'year' => 2000,
    ]);

    $this->deleteJson("/api/books/{$book->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('books', ['id' => $book->id]);
});

test('book data is validated before it is saved', function () {
    $this->postJson('/api/books', [
        'title' => '',
        'author' => '',
        'year' => 'not-a-year',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'author', 'year']);
});
