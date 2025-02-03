import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

# Load the CSV files
user_df = pd.read_csv('bookings.csv')
package_df = pd.read_csv('packages.csv')
review_df = pd.read_csv('reviews.csv')

# Clean column names (strip extra spaces if any)
user_df.columns = user_df.columns.str.strip()
package_df.columns = package_df.columns.str.strip()
review_df.columns = review_df.columns.str.strip()

# Rename package_id in user_df and review_df to avoid conflicts during merge
user_df = user_df.rename(columns={'package_id': 'user_package_id'})
review_df = review_df.rename(columns={'package_id': 'review_package_id'})

# Merging the datasets on user_email first
merged_df = pd.merge(user_df, review_df, on='user_email')

# Now merge with the package data to get package names
merged_df = pd.merge(merged_df, package_df[['package_id', 'name']], left_on='review_package_id', right_on='package_id')

# Creating the user-item matrix with ratings
user_item_matrix = merged_df.pivot_table(index='user_email', columns='name', values='rating', aggfunc='mean').fillna(0)

# Standardize the user-item matrix for cosine similarity
user_item_matrix_scaled = StandardScaler().fit_transform(user_item_matrix)

# Calculate Cosine Similarity dynamically for the target user
def calculate_cosine_similarity(user_item_matrix_scaled, target_user_index):
    target_user_data = user_item_matrix_scaled[target_user_index].reshape(1, -1)
    cosine_sim = cosine_similarity(target_user_data, user_item_matrix_scaled)
    return cosine_sim.flatten()

# Calculate Pearson correlation dynamically for the target user
def calculate_pearson_correlation(user_item_matrix, target_user_index):
    target_user_data = user_item_matrix.iloc[target_user_index]
    pearson_corr = user_item_matrix.corrwith(target_user_data)
    return pearson_corr

def get_recommendations(target_user):
    try:
        # Check if the target user exists in the user-item matrix
        if target_user not in user_item_matrix.index:
            raise ValueError(f"User {target_user} not found in the dataset.")
        
        target_user_index = user_item_matrix.index.get_loc(target_user)
        
        # Calculate Cosine Similarity and Pearson Correlation for the target user
        cosine_sim = calculate_cosine_similarity(user_item_matrix_scaled, target_user_index)
        pearson_corr = calculate_pearson_correlation(user_item_matrix, target_user_index)

        # Ensure both cosine_sim and pearson_corr have the same user indices
        common_users = user_item_matrix.index

        # Align cosine_sim and pearson_corr by the common set of users (ensuring the same length)
        cosine_sim_df = pd.Series(cosine_sim, index=user_item_matrix.index)
        pearson_corr_df = pd.Series(pearson_corr, index=user_item_matrix.index)

        # Combine Cosine Similarity and Pearson Correlation to get a hybrid score
        hybrid_sim = (cosine_sim_df + pearson_corr_df) / 2

        # Get similar users based on the hybrid similarity matrix
        similar_users = hybrid_sim.sort_values(ascending=False)

        # Create a dictionary to store package recommendations based on similar users' ratings
        package_recommendations = {}

        # Iterate through the similar users
        for user in similar_users.index[1:]:  # Skipping the target user itself
            user_ratings = user_item_matrix.loc[user]
            
            # Consider packages that the user has rated highly (e.g., rating > 3)
            for package, rating in user_ratings[user_ratings > 3].items():
                if package not in package_recommendations:
                    package_recommendations[package] = []
                package_recommendations[package].append(rating)

        # Average ratings for each package and sort by highest average rating
        package_avg_ratings = {package: sum(ratings) / len(ratings) for package, ratings in package_recommendations.items()}
        sorted_recommendations = sorted(package_avg_ratings.items(), key=lambda x: x[1], reverse=True)

        # Get the top 10 recommended packages based on average rating
        top_10_packages = [package for package, _ in sorted_recommendations[:10]]

        # Fetch details of the top 10 recommended packages
        recommended_packages_details = package_df[package_df['name'].isin(top_10_packages)]

        # Returning the recommended packages as a list of dictionaries
        return recommended_packages_details.to_dict(orient="records")
    
    except Exception as e:
        return str(e)


# Example of how to get recommendations for a user
user_email = "user1@example.com"
recommended_packages = get_recommendations(user_email)
print(recommended_packages)
