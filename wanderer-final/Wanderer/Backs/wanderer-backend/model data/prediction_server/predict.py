import pandas as pd
import numpy as np
import re
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import joblib
# Load the dataset
data_path = "cleaned_dataset.csv"  # Update to your file path
data = pd.read_csv(data_path)

# Clean data: Drop rows with any NaN values across all columns
data_cleaned = data.dropna()
print(f"Number of unique places after cleaning: {data_cleaned['Place'].nunique()}")

# Handle outliers in Price
q1 = data_cleaned["Price"].quantile(0.25)
q3 = data_cleaned["Price"].quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr
data_filtered = data_cleaned[(data_cleaned["Price"] >= lower_bound) & (data_cleaned["Price"] <= upper_bound)]

# Normalize Price and Area_Sqft
scaler = MinMaxScaler()
data_filtered[['Price', 'Area_Sqft']] = scaler.fit_transform(data_filtered[['Price', 'Area_Sqft']])

# Extract additional features
data_filtered['Year_Built'] = 2025 - data_filtered['Year']  # Property age
unique_values = data_filtered['Property_Type'].unique()

# Print unique values
print(f"Unique values in column '{'Property_Type'}':")
for value in unique_values:
    print(value)

# Select relevant features for the model
features = ["Area_Sqft", "City", "Place", "Property_Type", "Bedroom", "Bathroom", "Parking", "Year_Built"]
X = data_filtered[features]
y = data_filtered["Price"]

# One-hot encode categorical features
X = pd.get_dummies(X, columns=["City", "Place", "Property_Type"], drop_first=True)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train Random Forest model
model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# Feature importance
feature_importance = model.feature_importances_
feature_names = X.columns

# Evaluate the model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("Model Evaluation:")
print(f"Mean Absolute Error: {mae:.2f}")
print(f"R2 Score: {r2:.2f}")

# Print normalized sample data
print("\nSample of normalized data:")
print(data_filtered[['Price', 'Area_Sqft']].head())

# Save the trained model
model_path = "random_forest_model.pkl"
joblib.dump(model, model_path)
print(f"Model saved at {model_path}")


# Save model features for alignment
model_features_path = "model_features.pkl"
joblib.dump(X.columns.tolist(), model_features_path)
print(f"Model features saved at {model_features_path}")


scaler_path = "scaler.pkl"
joblib.dump(scaler, scaler_path)
print(f"Scaler saved at {scaler_path}")