export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface IngredientCategory {
    id: number;
    category_name: string;
}

export interface Ingredient {
    id: number;
    ingredient_name: string;
    ingredient_category_id: number;
    category?: IngredientCategory;
}

export interface ShoppingList {
    id: number;
    ingredients_id: number | null;
    custom_item: string | null;
    user_id: number;
    created_at: string;
    ingredient?: Ingredient;
    in_refrigerator: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
