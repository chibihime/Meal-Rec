# Recipe Finder

This script helps you find recipes based on the ingredients you have. It searches through a dataset of recipes and displays the matching recipes along with their images.

## Requirements

- Python 3.7 or later
- The required Python packages are listed in the `requirements.txt` file.

## Dataset Availability 
- The one I've used can be found here: https://www.kaggle.com/datasets/pes12017000148/food-ingredients-and-recipe-dataset-with-images 

## Setup

1. Clone this repository or download the script.
2. Ensure you have the required packages installed by running:

    ```bash
    pip install -r requirements.txt
    ```

3. Prepare your data file (CSV) with the following columns:
   - `Title`: The title of the recipe.
   - `Ingredients`: The ingredients list.
   - `Instructions`: The recipe instructions.
   - `Image_Name`: The image file name corresponding to the recipe.
   - `Cleaned_Ingredients`: Ingredients list cleaned and formatted.
    

4. Place your images in a directory of your choice.

# Alternate 
This project is a smart ingredient-based recipe recommendation system powered by Python. Originally built as a terminal-based application, it has now been enhanced with a clean and responsive Tkinter GUI to improve usability and interaction.

### Features:
Upload a CSV file containing recipes and cleaned ingredients.

Select a directory of corresponding images.

Enter ingredients to find the top 3 matching recipes.

Displays recipe titles, ingredients, instructions, and image previews.

Handles missing or unmatched recipes gracefully.

## Usage

Run the script:

```bash
python Meal Rec.py


python Meal rec gui.py


