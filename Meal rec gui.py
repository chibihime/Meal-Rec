#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import os
from PIL import Image, ImageTk
import tkinter as tk
from tkinter import filedialog, messagebox


class RecipeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Recipe Finder")
        self.root.configure(bg="black")

        self.data = None
        self.image_dir = ""

        # Fonts and colors
        font = ("Playfair Display", 12)
        fg_color = "white"
        bg_color = "black"

        # Input for CSV
        tk.Label(
            root, text="Select CSV File:", fg=fg_color, bg=bg_color, font=font
        ).pack()
        tk.Button(root, text="Browse", command=self.load_csv).pack()

        # Input for image directory
        tk.Label(
            root, text="Select Image Directory:", fg=fg_color, bg=bg_color, font=font
        ).pack()
        tk.Button(root, text="Browse", command=self.set_image_dir).pack()

        # Ingredient entry
        self.ingredient_entry = tk.Entry(root, width=50)
        self.ingredient_entry.pack(pady=10)
        tk.Button(root, text="Search Recipes", command=self.search_recipes).pack(pady=5)

        # Results display
        self.results = tk.Text(
            root, height=15, width=80, wrap="word", bg="#111", fg="white"
        )
        self.results.pack(pady=10)

    def load_csv(self):
        file_path = filedialog.askopenfilename(filetypes=[("CSV Files", "*.csv")])
        if file_path:
            try:
                self.data = pd.read_csv(file_path)
                self.data.fillna("none", inplace=True)
                messagebox.showinfo("Success", "CSV Loaded Successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load CSV:\n{e}")

    def set_image_dir(self):
        self.image_dir = filedialog.askdirectory()
        if self.image_dir:
            messagebox.showinfo("Success", f"Image directory set:\n{self.image_dir}")

    def search_recipes(self):
        self.results.delete("1.0", tk.END)
        if self.data is None or not self.image_dir:
            messagebox.showerror("Error", "Please load CSV and image directory first.")
            return

        user_input = self.ingredient_entry.get()
        if not user_input.strip():
            messagebox.showwarning("Input Needed", "Please enter ingredients.")
            return

        ingredients = [i.strip().lower() for i in user_input.split(",")]
        matching = self.data[
            self.data["Cleaned_Ingredients"].apply(
                lambda x: all(ing in x.lower() for ing in ingredients)
            )
        ].head(3)

        if matching.empty:
            self.results.insert(tk.END, "No matching recipes found.")
        else:
            for _, row in matching.iterrows():
                self.results.insert(tk.END, f"Title: {row['Title']}\n")
                self.results.insert(tk.END, f"Ingredients: {row['Ingredients']}\n")
                self.results.insert(tk.END, f"Instructions: {row['Instructions']}\n")
                self.results.insert(tk.END, "-" * 50 + "\n")
                self.show_image(row["Image_Name"])

    def show_image(self, image_name):
        try:
            img_path = os.path.join(self.image_dir, image_name + ".jpg")
            img = Image.open(img_path)
            img.thumbnail((200, 200))
            img = ImageTk.PhotoImage(img)

            img_label = tk.Label(self.root, image=img, bg="black")
            img_label.image = img  # prevent garbage collection
            img_label.pack()
        except Exception as e:
            self.results.insert(tk.END, f"[Image not found: {image_name}]\n")


if __name__ == "__main__":
    root = tk.Tk()
    app = RecipeApp(root)
    root.mainloop()
