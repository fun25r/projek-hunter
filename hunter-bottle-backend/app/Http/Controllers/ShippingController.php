<?php

namespace App\Http\Controllers;

use App\Service\RajaOngkirService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    private RajaOngkirService $rajaOngkir;

    public function __construct(RajaOngkirService $rajaOngkir)
    {
        $this->rajaOngkir = $rajaOngkir;
    }

    public function provinces()
    {
        return response()->json($this->rajaOngkir->getProvinces());
    }

    public function cities(Request $request)
    {
        $provinceId = $request->query('province_id');
        return response()->json($this->rajaOngkir->getCities($provinceId));
    }

    public function subdistricts(Request $request)
    {
        $request->validate(['city_id' => 'required|integer']);
        return response()->json(
            $this->rajaOngkir->getSubdistricts($request->city_id)
        );
    }

    public function cost(Request $request)
    {
        $request->validate([
            'destination_city_id' => 'required|integer',
            'weight_gram'         => 'required|integer|min:1',
            'courier'             => 'required|string|in:jne,pos,tiki',
        ]);

        return response()->json(
            $this->rajaOngkir->getCost(
                $request->destination_city_id,
                $request->weight_gram,
                $request->courier
            )
        );
    }
}
