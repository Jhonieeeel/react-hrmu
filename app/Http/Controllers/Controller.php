<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    // Provides $this->authorize() for the policies under App\Policies.
    use AuthorizesRequests;
}
