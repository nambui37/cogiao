<?php
namespace Utils;

class VietQR {
    // MB Bank bin: 970422, VCB: 970436, Techcom: 970407, VietinBank: 970415
    public static function generateQRUrl(string $bankId, string $accountNo, float $amount, string $memo, string $accountName): string {
        $cleanBank = urlencode($bankId ?: 'MB');
        $cleanAcc = urlencode($accountNo ?: '0912345678');
        $cleanAmount = intval($amount);
        $cleanMemo = urlencode($memo);
        $cleanName = urlencode($accountName ?: 'NGUYEN THI THUY');

        return "https://img.vietqr.io/image/{$cleanBank}-{$cleanAcc}-compact2.png?amount={$cleanAmount}&addInfo={$cleanMemo}&accountName={$cleanName}";
    }
}
