<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'user:id,name,username,phone,customer_age,referral_source'])
            ->orderBy('created_at', 'desc');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQ) use ($search) {
                      $userQ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(15);

        // Get products for the create/edit form
        $products = Product::where('status', 'active')->orderBy('title')->get();
        $users = User::orderBy('name')->get(['id', 'name', 'username', 'email']);

        return Inertia::render('admin/orders', [
            'orders' => $orders,
            'products' => $products,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,completed,failed,refunded',
            'type' => 'required|in:registration,product_purchase',
            'payment_method' => 'nullable|string|max:255',
            'product_id' => 'nullable|exists:products,id',
        ]);

        // Generate unique order ID
        $orderId = 'ORD-' . strtoupper(Str::random(8)) . '-' . time();

        // Build meta data
        $meta = [];
        if ($validated['product_id'] ?? null) {
            $product = Product::find($validated['product_id']);
            $meta['product'] = [
                'id' => $product->id,
                'title' => $product->title,
            ];
        }

        Order::create([
            'order_id' => $orderId,
            'user_id' => $validated['user_id'],
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'type' => $validated['type'],
            'payment_method' => $validated['payment_method'],
            'meta' => $meta,
        ]);

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order created successfully.');
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,completed,failed,refunded',
            'type' => 'required|in:registration,product_purchase',
            'payment_method' => 'nullable|string|max:255',
            'product_id' => 'nullable|exists:products,id',
        ]);

        // Build meta data
        $meta = $order->meta ?? [];
        if ($validated['product_id'] ?? null) {
            $product = Product::find($validated['product_id']);
            $meta['product'] = [
                'id' => $product->id,
                'title' => $product->title,
            ];
        }

        $order->update([
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'type' => $validated['type'],
            'payment_method' => $validated['payment_method'],
            'meta' => $meta,
        ]);

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order deleted successfully.');
    }

    /**
     * Export orders to CSV.
     */
    public function export()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Customer Phone',
                'Type',
                'Product',
                'Amount',
                'Payment Method',
                'Status',
                'Customer Age',
                'Referral Source',
                'Created At',
            ]);

            // Stream data in chunks
            Order::with('user')->orderBy('created_at', 'desc')
                ->chunk(500, function ($orders) use ($handle) {
                    foreach ($orders as $order) {
                        fputcsv($handle, [
                            $order->order_id,
                            $order->user?->name ?? 'N/A',
                            $order->user?->email ?? 'N/A',
                            $order->user?->phone ?? 'N/A',
                            $order->type ?? 'registration',
                            $order->meta['product']['title'] ?? '-',
                            $order->amount,
                            $order->payment_method ?? '-',
                            $order->status,
                            $order->user?->customer_age ?? '-',
                            $order->user?->referral_source ?? '-',
                            $order->created_at->format('Y-m-d H:i:s'),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
