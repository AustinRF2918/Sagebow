function _computeCalories(protein, carbs, fat) {
    return ((protein * 4) + (carbs * 4) + (fat * 9));
}

var NutrientRatio = function(protein, carbs, fat) {
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
    this.calories = _computeCalories(protein, carbs, fat);
};












