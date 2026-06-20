<?php

use App\Services\TelegramOrderService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('telegram:webhook {url? : Full public webhook URL} {--info : Show current webhook info} {--delete : Delete current webhook}', function () {
    /** @var TelegramOrderService $telegram */
    $telegram = app(TelegramOrderService::class);

    if ($this->option('delete')) {
        $telegram->deleteWebhook()
            ? $this->info('Telegram webhook deleted.')
            : $this->error('Telegram webhook was not deleted. Check TELEGRAM_BOT_TOKEN and logs.');

        return;
    }

    if ($this->option('info')) {
        $info = $telegram->getWebhookInfo();

        if ($info === null) {
            $this->error('Could not load Telegram webhook info. Check TELEGRAM_BOT_TOKEN and logs.');

            return;
        }

        $this->line(json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return;
    }

    $url = $this->argument('url') ?: config('services.telegram.webhook_url');

    if (blank($url)) {
        $url = rtrim((string) config('app.url'), '/') . '/api/telegram/webhook/' . config('services.telegram.webhook_secret');
    }

    if (!str_starts_with((string) $url, 'https://')) {
        $this->warn('Telegram accepts webhooks only over HTTPS. Use a public HTTPS URL in production.');
    }

    $telegram->setWebhook((string) $url)
        ? $this->info("Telegram webhook set to {$url}")
        : $this->error('Telegram webhook was not set. Check TELEGRAM_BOT_TOKEN, URL availability, and logs.');
})->purpose('Set, inspect, or delete the Telegram order webhook');

Artisan::command('telegram:updates', function () {
    /** @var TelegramOrderService $telegram */
    $telegram = app(TelegramOrderService::class);
    $updates = $telegram->getUpdates();

    if ($updates === null) {
        $this->error('Could not load Telegram updates. Check TELEGRAM_BOT_TOKEN and logs.');

        return;
    }

    if ($updates === []) {
        $this->warn('No updates found. Send a message to the bot, then run this command again.');

        return;
    }

    foreach ($updates as $update) {
        $chat = data_get($update, 'message.chat') ?: data_get($update, 'callback_query.message.chat');
        $text = data_get($update, 'message.text') ?: data_get($update, 'callback_query.data');

        $this->line(sprintf(
            'chat_id=%s title=%s username=%s text=%s',
            data_get($chat, 'id', '-'),
            data_get($chat, 'title', data_get($chat, 'first_name', '-')),
            data_get($chat, 'username', '-'),
            $text ?: '-'
        ));
    }
})->purpose('Show recent Telegram updates to find TELEGRAM_CHAT_ID');
