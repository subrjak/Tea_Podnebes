<?php

namespace Tests\Feature;

use App\Models\DiscountEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_does_not_grant_admin_access_by_name(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Богдан',
            'email' => 'bogdan@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.is_admin', false)
            ->assertJsonPath('user.admin_status', null)
            ->assertJsonPath('user.permissions.admin', false)
            ->assertJsonPath('user.permissions.inventory', false)
            ->assertJsonPath('user.permissions.users', false);
    }

    public function test_me_returns_effective_discount_with_active_event(): void
    {
        DiscountEvent::create([
            'title' => 'Weekend',
            'discount_percent' => 25,
            'is_active' => true,
        ]);

        $registerResponse = $this->postJson('/api/register', [
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $token = $registerResponse->json('token');

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.status_discount_percent', 0)
            ->assertJsonPath('user.event_discount_percent', 25)
            ->assertJsonPath('user.effective_discount_percent', 25)
            ->assertJsonPath('user.discount_percent', 25);
    }
}
