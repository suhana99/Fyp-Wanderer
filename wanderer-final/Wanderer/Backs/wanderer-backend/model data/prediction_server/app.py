from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity


# Load the CSV files
user_df = pd.read_csv('bookings.csv')
package_df = pd.read_csv('packages.csv')
review_df = pd.read_csv('reviews.csv')


# Clean column names
user_df.columns = user_df.columns.str.strip()
package_df.columns = package_df.columns.str.strip()
review_df.columns = review_df.columns.str.strip()


# Merge datasets for collaborative filtering
user_df = user_df.rename(columns={'package_id': 'user_package_id'})
review_df = review_df.rename(columns={'package_id': 'review_package_id'})
merged_df = pd.merge(user_df, review_df, on='user_email')
merged_df = pd.merge(merged_df, package_df[['package_id', 'name']], left_on='review_package_id', right_on='package_id')
user_item_matrix = merged_df.pivot_table(index='user_email', columns='name', values='rating', aggfunc='mean').fillna(0)
# print(user_item_matrix)
print(user_item_matrix.head(10))

# Collaborative Filtering Using Pearson Correlation
user_corr = user_item_matrix.T.corr(method='pearson')  # User-user Pearson correlation matrix
print(user_corr)

# Content-Based Filtering
def create_content_similarity_matrix(package_df):
    # Feature extraction from description using TfidfVectorizer
    tfidf = TfidfVectorizer(stop_words='english')
    description_matrix = tfidf.fit_transform(package_df['description'])

    # Normalize numerical features like base_price and duration
    scaler = MinMaxScaler()
    package_df[['base_price', 'duration']] = scaler.fit_transform(package_df[['base_price', 'duration']])


    # Create feature matrix by concatenating TF-IDF (description), location (one-hot encoding), and numerical features
    features_matrix = pd.concat([
        pd.DataFrame(description_matrix.toarray(), index=package_df.index),  # TF-IDF features
        pd.get_dummies(package_df['location']),  # One-hot encoded location features
        package_df[['base_price', 'duration']]  # Normalized base_price and duration
    ], axis=1)
    # print(features_matrix)
    # print(features_matrix.head())


    # Compute the cosine similarity matrix from the combined features
    return cosine_similarity(features_matrix)


cosine_sim_cb = create_content_similarity_matrix(package_df)
print(cosine_sim_cb)


# Popularity-Based Recommendation
def get_popularity_based_recommendations(top_n=10):
    package_popularity = (
        review_df.groupby('review_package_id')
        .agg({'rating': ['mean', 'count']})  # Get average rating and review count
    )
    package_popularity.columns = ['average_rating', 'review_count']
    package_popularity = package_popularity.sort_values(by=['average_rating', 'review_count'], ascending=False)
   
    # Get top packages
    top_packages = package_popularity.head(top_n).index
    return package_df[package_df['package_id'].isin(top_packages)]


# FastAPI setup
app = FastAPI()


# CORS settings
origins = [
    "http://localhost:3000",  # Update with your frontend URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define input data structure for POST request
class PredictionRequest(BaseModel):
    user_email: str  # User email for which to get recommendations
    cosine_weight: float = 0.5  # Weight for content-based recommendations
    pearson_weight: float = 0.5  # Weight for collaborative filtering


# Recommendation function
@app.post("/predict/")
def recommend_packages(data: PredictionRequest):
    try:
        target_user = data.user_email
        cosine_weight = data.cosine_weight
        pearson_weight = data.pearson_weight


        # Check if the target user exists in the user-item matrix
        if target_user not in user_corr.index:
            # Cold-start: Popularity-based for new users
            recommendations = get_popularity_based_recommendations(top_n=10)
            print("popular",recommendations)
            return {"recommended_packages": recommendations.to_dict(orient='records')}


        # Collaborative Filtering Recommendations using Pearson Correlation
        similar_users = user_corr[target_user].sort_values(ascending=False).index[1:]  # Exclude the user themselves
        user_recommendations = {}
        for similar_user in similar_users:
            user_ratings = user_item_matrix.loc[similar_user]
            for package, rating in user_ratings[user_ratings > 0].items():
                if package not in user_recommendations:
                    user_recommendations[package] = []
                user_recommendations[package].append(rating)
        print("collaborative",user_recommendations)


        # Calculate average rating for each package
        cf_scores = {
            package: sum(ratings) / len(ratings)
            for package, ratings in user_recommendations.items()
            if package not in user_item_matrix.loc[target_user] or user_item_matrix.loc[target_user][package] == 0
        }


        # Content-Based Recommendations
        user_interacted_packages = user_item_matrix.loc[target_user][user_item_matrix.loc[target_user] > 0].index
        cb_recommendations = {}
        for package in user_interacted_packages:
            package_idx = package_df[package_df['name'] == package].index[0]
            similar_packages = cosine_sim_cb[package_idx]
            for idx, similarity in enumerate(similar_packages):
                cb_package = package_df.iloc[idx]['name']
                if cb_package not in user_interacted_packages:  # Exclude already interacted packages
                    if cb_package not in cb_recommendations:
                        cb_recommendations[cb_package] = 0
                    cb_recommendations[cb_package] += similarity
        print("content",cb_recommendations)

        # Normalize scores
        if cf_scores:
            cf_series = pd.Series(cf_scores).rank(pct=True)
        else:
            cf_series = pd.Series(dtype=float)


        if cb_recommendations:
            cb_series = pd.Series(cb_recommendations).rank(pct=True)
        else:
            cb_series = pd.Series(dtype=float)


        # Combine scores using weights
        combined_scores = (cf_series * pearson_weight) + (cb_series * cosine_weight)
        combined_scores = combined_scores.sort_values(ascending=False).head(10)


        # Fetch package details
        recommended_packages = package_df[package_df['name'].isin(combined_scores.index)]


        # Debug logs (remove in production)
        # print(f"Target User: {target_user}")
        # print(f"User Interacted Packages: {list(user_interacted_packages)}")
        print(f"\n\n\n\n\nCF Scores: {cf_scores}")
        print(f"\n\n\n\nCB Scores: {cb_recommendations}")
        print(f"Combined Scores: {combined_scores}")
        return {"recommended_packages": recommended_packages.to_dict(orient='records')}
   
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
