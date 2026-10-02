<?php

test('the root url redirects a signed-in user somewhere', function () {
    $user = App\Models\User::factory()->create();
    App\Models\Employee::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('home'));

    // Which page depends on the caller's access, so the assertion is only that
    // it lands rather than 403s or 500s.
    $response->assertRedirect();
});

test('guests are sent to login from the root url', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});