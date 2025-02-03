import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load the user-package interaction data from CSV
user_df = pd.read_csv('bookings.csv')

# Load the package details from CSV
package_df = pd.read_csv('packages.csv')

# Create a user-item matrix
user_item_matrix = pd.pivot_table(user_df, values='user_id', index='user_email', columns='package_id', aggfunc=lambda x: 1, fill_value=0)

# Compute cosine similarity between users (user-based collaborative filtering)
user_similarity = cosine_similarity(user_item_matrix)

# Create a DataFrame for easier manipulation
user_similarity_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)

# Recommend top 10 packages based on the highest similarity for a specific user (e.g., user1@example.com)
target_user = 'user1@example.com'
user_similarities = user_similarity_df[target_user].sort_values(ascending=False)
top_similar_users = user_similarities.iloc[1:11].index  # exclude the target user itself

# Get packages liked by the top similar users
recommended_package_ids = user_df[user_df['user_email'].isin(top_similar_users)]['package_id'].value_counts().head(10)

# Convert the Series to DataFrame for merging
recommended_package_df = recommended_package_ids.reset_index()
recommended_package_df.columns = ['package_id', 'count']

# Merge with package details, including price
recommended_packages_details = pd.merge(recommended_package_df, package_df[['package_id', 'name', 'location', 'price']], on='package_id')

# Display the recommended packages
print(recommended_packages_details)
