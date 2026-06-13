<?php

namespace App\Support;

class CustomerStatus
{
    public static function fromQuantity(int $quantity): array
    {
        return match (true) {
            $quantity >= 50 => [
                'title' => 'Чайный мастер',
                'discount' => 35,
                'next_title' => null,
                'next_quantity' => null,
            ],
            $quantity >= 30 => [
                'title' => 'Чайный гуру',
                'discount' => 25,
                'next_title' => 'Чайный мастер',
                'next_quantity' => 50,
            ],
            $quantity >= 15 => [
                'title' => 'Чайный пьяница',
                'discount' => 18,
                'next_title' => 'Чайный гуру',
                'next_quantity' => 30,
            ],
            $quantity >= 8 => [
                'title' => 'Чайный знаток',
                'discount' => 10,
                'next_title' => 'Чайный пьяница',
                'next_quantity' => 15,
            ],
            $quantity >= 3 => [
                'title' => 'Чайный любитель',
                'discount' => 5,
                'next_title' => 'Чайный знаток',
                'next_quantity' => 8,
            ],
            default => [
                'title' => 'Обычный покупатель',
                'discount' => 0,
                'next_title' => 'Чайный любитель',
                'next_quantity' => 3,
            ],
        };
    }
}
