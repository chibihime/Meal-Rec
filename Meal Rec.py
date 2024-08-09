#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
from PIL import Image
import os


def load_data(file_path):
    """Load data from a CSV file."""
    return pd.read_csv(file_path)


def get_matching_recipes(data, ingredients):
    """Get recipes matching the given ingredients."""
    ingredients = [ingredient.strip().lower() for ingredient in ingredients.split(",")]
    matching_recipes = data[
        data["Cleaned_Ingredients"].apply(
            lambda x: all(ingredient in x.lower() for ingredient in ingredients)
        )
    ]
    return matching_recipes.head(3)


def display_image(image_path):
    """Display the image given the image path."""
    try:
        img = Image.open(image_path)
        img.show()
    except Exception as e:
        print(f"Error displaying image {image_path}: {e}")


def main():
    # Prompt user for file path and image directory
    data_file = input("Enter the path to your data file (CSV): ")
    image_dir = input("Enter the directory path to your images: ")

    # Load the data
    data = load_data(data_file)

    # Check for null values and fill them with 'none'
    data.fillna("none", inplace=True)

    # Get user input for ingredients
    user_input = input("Enter ingredients separated by commas: ")

    # Get matching recipes
    matching_recipes = get_matching_recipes(data, user_input)

    # Print and display matching recipes
    if not matching_recipes.empty:
        for index, row in matching_recipes.iterrows():
            print(f"Title: {row['Title']}")
            print(f"Ingredients: {row['Ingredients']}")
            print(f"Instructions: {row['Instructions']}")

            image_name = row["Image_Name"]
            image_path = os.path.join(image_dir, image_name + ".jpg")
            print(f"Image: {image_path}")
            print("=" * 50)

            display_image(image_path)
    else:
        print("No matching recipes found.")


if __name__ == "__main__":
    main()
