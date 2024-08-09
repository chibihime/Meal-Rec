# Recipe Finder

This script helps you find recipes based on the ingredients you have. It searches through a dataset of recipes and displays the matching recipes along with their images.

## Requirements

- Python 3.7 or later
- The required Python packages are listed in the `requirements.txt` file.

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

## Usage

Run the script:

```bash
python recipe_finder.py

