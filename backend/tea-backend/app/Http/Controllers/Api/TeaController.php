<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tea;
use Illuminate\Http\Request;

class TeaController extends Controller
{
    public function index()
    {
        $teas = Tea::with('category:id,name,slug')
            ->select('id', 'name', 'slug', 'price', 'stock', 'image', 'category_id')
            ->paginate(12);
        return response()->json($teas);
    }

    // Детальная информация
    public function show($slug)
    {
        $tea = Tea::where('slug', $slug)
            ->with('category:id,name,slug')
            ->firstOrFail();
        return response()->json($tea);
    }
}
