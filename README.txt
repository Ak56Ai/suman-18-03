-- Insert sample product with all new features
INSERT INTO products (
  id, name, description, price, original_price, image_url, category, stock,
  brand, size, country_of_origin, shelf_life, product_story, specifications, images
) VALUES (
  gen_random_uuid(),
  'Ayurvedic Wellness Kit',
  'Complete wellness kit with 5 essential Ayurvedic products for daily use',
  2499.00,
  3999.00,
  'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
  'Wellness Kits',
  100,
  'NaturZen',
  'Standard',
  'India',
  '24 months',
  'This wellness kit is crafted using ancient Ayurvedic wisdom...',
  '[
    {"key": "Ingredients", "value": "Ashwagandha, Tulsi, Brahmi"},
    {"key": "Usage", "value": "Take 1 capsule twice daily"},
    {"key": "Benefits", "value": "Stress relief, improved immunity"}
  ]'::jsonb,
  '[
    "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
    "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
    "https://images.pexels.com/photos/3822635/pexels-photo-3822635.jpeg"
  ]'::jsonb
);