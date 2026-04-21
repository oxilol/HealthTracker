import { NextRequest, NextResponse } from 'next/server';

function relevanceScore(name: string, query: string): number {
  const lowerName = name.toLowerCase(), lowerQuery = query.toLowerCase();
  if (lowerName === lowerQuery) return 100;
  if (lowerName.startsWith(lowerQuery)) return 90;

  const words = lowerQuery.split(/\s+/);
  const hasAll = words.every(word => lowerName.includes(word));
  let score = words.reduce((acc, word) => acc + (lowerName.includes(word) ? 15 : 0), 0) + (hasAll ? 30 : 0);

  return score + (lowerName.length < 25 ? 15 : lowerName.length < 40 ? 10 : lowerName.length > 80 ? -10 : 0);
}

// GET: Proxies searches to the USDA FoodData Central API and returns scored results
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.trim().length < 2) return NextResponse.json({ products: [] });

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=30&dataType=Foundation,SR%20Legacy&api_key=${process.env.USDA_API_KEY}`;

    // 8-second abort signal setup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) throw new Error(`USDA API: ${res.status}`);
    const data = await res.json();

    const products = (data.foods || [])
      .filter((foodItem: any) => foodItem.description)
      .map((foodItem: any) => {
        // Map nutrient array to object dictionary for quick lookup
        const nutrientMap = Object.fromEntries((foodItem.foodNutrients || []).map((nutrient: any) => [nutrient.nutrientId, nutrient.value || 0]));
        return {
          name: foodItem.description,
          calories: Math.round(nutrientMap[1008] || 0),
          protein: Math.round((nutrientMap[1003] || 0) * 10) / 10,
          carbohydrates: Math.round((nutrientMap[1005] || 0) * 10) / 10,
          fat: Math.round((nutrientMap[1004] || 0) * 10) / 10,
          base_quantity: 100,
          base_unit: 'g',
          source: 'api',
        };
      })
      .filter((foodItem: any) => foodItem.calories > 0)
      .sort((foodA: any, foodB: any) => relevanceScore(foodB.name, query) - relevanceScore(foodA.name, query))
      .slice(0, 20);

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Food search error:', err);
    return NextResponse.json({ products: [] });
  }
}
