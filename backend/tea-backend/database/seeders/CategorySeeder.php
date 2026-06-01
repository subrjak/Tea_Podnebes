<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    $categories = [
        ['name' => 'Зелёный', 'slug' => 'green'],
        ['name' => 'Чёрный', 'slug' => 'black'],
        ['name' => 'Улун', 'slug' => 'oolong'],
        ['name' => 'Пуэр', 'slug' => 'puer'],
        ['name' => 'Белый', 'slug' => 'white'],
        ['name' => 'Красный', 'slug' => 'red'],
    ];
    foreach ($categories as $cat) {
        Category::create($cat);
    }
}
}
