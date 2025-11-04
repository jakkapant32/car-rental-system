#!/usr/bin/env python3
"""
Script to generate and print QR codes for vehicles in batch
"""
import qrcode
import sys
import os

def generate_qr_batch(qr_values, output_dir='./qr-prints'):
    """Generate QR code images for batch printing"""
    os.makedirs(output_dir, exist_ok=True)
    
    for qr_value in qr_values:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_value)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        filename = os.path.join(output_dir, f"{qr_value}.png")
        img.save(filename)
        print(f"Generated: {filename}")
    
    print(f"\n✅ Generated {len(qr_values)} QR codes in {output_dir}")

if __name__ == '__main__':
    # Example usage
    qr_values = sys.argv[1:] if len(sys.argv) > 1 else []
    
    if not qr_values:
        print("Usage: python generate_qr.py QR_VALUE1 QR_VALUE2 ...")
        sys.exit(1)
    
    generate_qr_batch(qr_values)


