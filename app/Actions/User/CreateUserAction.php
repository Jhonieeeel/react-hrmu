<?php

namespace App\Actions\User;

use App\Data\UserDTO;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function execute(UserDTO $data): User {

        $user =  User::create([
                'name' => $data->name,
                'email' => $data->email,
                'is_transferee' => $data->is_transferee,
                'password' => Hash::make($data->password),
            ]);

        if (!$data->is_transferee) {
            // if yes then default 0
            $this->defaultBalance($data, $user);
        }

        return $user;
    }

    public function defaultBalance(UserDTO $data, User $user) {

       $leaves = ['vacation leave', 'sick leave'];

        foreach($leaves as $leave){
            Leave::create([
                'user_id' => $user->id,
                'leave_type' => $leave,
                'event_type' => 'accrual',
                'event_tag' => 'accrual',
                'balance' => 0,
                'starts_at' => $data->starts_at,
                'ends_at' => $data->ends_at
            ]);
       }

        //    monthly filing
        Leave::create([
            'user_id' => $user->id,
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at,
            'status' => false
        ]);
    }
}
