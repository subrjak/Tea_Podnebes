<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_decrements_stock_by_requested_grams(): void
    {
        $token = $this->postJson('/api/register', [
            'name' => 'Customer',
            'email' => 'order-customer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->json('token');

        $category = Category::create([
            'name' => 'Puer',
            'slug' => 'puer',
        ]);

        $tea = Tea::create([
            'category_id' => $category->id,
            'name' => 'Test Tea',
            'slug' => 'test-tea',
            'description' => 'Test tea',
            'origin' => 'China',
            'age' => 1,
            'price' => 1000,
            'stock' => 1000,
        ]);

        $this->withToken($token)
            ->postJson('/api/orders', [
                'customer' => [
                    'name' => 'Customer',
                    'phone' => '+70000000000',
                    'address' => 'Test address',
                ],
                'payment_method' => 'cash',
                'items' => [
                    ['id' => $tea->id, 'weight' => 100, 'quantity' => 1],
                    ['id' => $tea->id, 'weight' => 200, 'quantity' => 1],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('order.total_weight', 300);

        $this->assertSame(700, $tea->fresh()->stock);
    }

    public function test_order_rejects_items_when_requested_grams_exceed_stock(): void
    {
        $token = $this->postJson('/api/register', [
            'name' => 'Customer',
            'email' => 'limited-stock@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->json('token');

        $category = Category::create([
            'name' => 'Oolong',
            'slug' => 'oolong',
        ]);

        $tea = Tea::create([
            'category_id' => $category->id,
            'name' => 'Limited Tea',
            'slug' => 'limited-tea',
            'description' => 'Limited tea',
            'origin' => 'China',
            'age' => 1,
            'price' => 1000,
            'stock' => 150,
        ]);

        $this->withToken($token)
            ->postJson('/api/orders', [
                'customer' => [
                    'name' => 'Customer',
                    'phone' => '+70000000000',
                    'address' => 'Test address',
                ],
                'payment_method' => 'cash',
                'items' => [
                    ['id' => $tea->id, 'weight' => 200, 'quantity' => 1],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items');

        $this->assertSame(150, $tea->fresh()->stock);
    }
}
