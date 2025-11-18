<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleMaterial extends Model
{
    protected $guarded = [];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
