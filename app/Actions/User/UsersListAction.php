<?php

namespace App\Actions\User;

use App\Models\User;

class UsersListAction {
    public function __invoke() {
        return User::query()->paginate(10)->withQueryString();
    }
}
