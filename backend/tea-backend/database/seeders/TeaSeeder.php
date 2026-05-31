<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tea;
use App\Models\Category;

class TeaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Получаем ID категорий по слагам
        $green = Category::where('slug', 'green')->first()->id;
        $black = Category::where('slug', 'black')->first()->id;
        $oolong = Category::where('slug', 'oolong')->first()->id;
        $puer = Category::where('slug', 'puer')->first()->id;

        $teas = [
            [
                'category_id' => $green,
                'name' => 'Лун Цзин (Колодец дракона)',
                'slug' => 'long-jing',
                'description' => 'Нежный зелёный чай с ореховыми нотками, один из десяти знаменитых чаёв Китая.',
                'origin' => 'Китай, провинция Чжэцзян',
                'age' => 0,
                'price' => 2500,
                'stock' => 30,
                'image' => 'teas/longjing.jpg',
                'brewing_temperature' => '75–80°C',
                'recommended_ware' => 'Стеклянный чайник или гайвань',
            ],
            [
                'category_id' => $oolong,
                'name' => 'Да Хун Пао',
                'slug' => 'da-hong-pao',
                'description' => 'Легендарный утёсный улун с глубоким, сладковатым вкусом и долгим послевкусием.',
                'origin' => 'Китай, горы Уишань',
                'age' => 5,
                'price' => 4500,
                'stock' => 15,
                'image' => 'teas/dahongpao.jpg',
                'brewing_temperature' => '90–95°C',
                'recommended_ware' => 'Исинский глиняный чайник',
            ],
            [
                'category_id' => $puer,
                'name' => 'Шу Пуэр "Золотая тыква"',
                'slug' => 'shu-puer',
                'description' => 'Выдержанный шу пуэр в форме тыквы, плотный, с оттенками сухофруктов и земли.',
                'origin' => 'Китай, Юньнань',
                'age' => 10,
                'price' => 3800,
                'stock' => 10,
                'image' => 'teas/puer.jpg',
                'brewing_temperature' => '95–100°C',
                'recommended_ware' => 'Глиняный чайник или фарфор',
            ],
            // добавь ещё несколько по желанию
        ];

        foreach ($teas as $tea) {
            Tea::create($tea);
        }
    }
}
