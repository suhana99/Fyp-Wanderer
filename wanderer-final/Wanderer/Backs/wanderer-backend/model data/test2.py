import pandas as pd
from scipy.stats import pearsonr
import numpy as np

# Load the user-package interaction data from CSV
user_df = pd.read_csv('bookings.csv')

# Load the package details from CSV
package_df = pd.read_csv('packages.csv')

# Create a user-item matrix
user_item_matrix = pd.pivot_table(user_df, values='user_id', index='user_email', columns='package_id', aggfunc=lambda x: 1, fill_value=0)

# Function to compute Pearson correlation between two users
def pearson_correlation(user1, user2):
    common_items = np.intersect1d(user1.index, user2.index)
    if len(common_items) == 0:
        return 0
    user1_ratings = user1[common_items]
    user2_ratings = user2[common_items]
    return pearsonr(user1_ratings, user2_ratings)[0]

# Compute user-user Pearson correlation matrix
user_similarity = np.zeros((user_item_matrix.shape[0], user_item_matrix.shape[0]))

for i in range(user_item_matrix.shape[0]):
    for j in range(i + 1, user_item_matrix.shape[0]):
        user_similarity[i, j] = pearson_correlation(user_item_matrix.iloc[i], user_item_matrix.iloc[j])
        user_similarity[j, i] = user_similarity[i, j]  # Pearson is symmetric

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
