import numpy as np

def get_random_centroids(X, k):
    '''
    Each centroid is a point in RGB space (color) in the image. 
    This function should randomly sample `k` different pixels from the input
    image as the initial centroids for the K-means algorithm.
    The selected `k` pixels should be sampled uniformly from all sets
    of `k` pixels in the image.
    Input: a single image of shape `(num_pixels, 3)` and `k`, the number of centroids. 
    Notice we are flattening the image to a two dimentional array.
    Output: Randomly chosen centroids of shape `(k,3)` as a numpy array. 
    '''
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    
    # Randomly select k indices (rows) from the range of num_pixels
    centroids = np.random.choice(X.shape[0], k, replace=False) # No replacement as we don't want to select the same pixel multiple times
    centroids = X[centroids, :].astype(float) # Select the pixels corresponding to the chosen indices (rows), meaning get the actual RGB values at those indices
    # Convert the selected pixels to float type to get correct results later on
    return centroids

    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################    
    

def l_p_dist_from_centroids(X, centroids, p=2):
    '''
    Inputs: 
    A single image of shape (num_pixels, 3)
    The centroids of shape (k, 3)
    The parameter p for the L_p norm distance measure.

    Output: numpy array of shape `(k, num_pixels)`,
    in which entry [j,i] holds the distance of the i-th pixel from the j-th centroid.
    '''
    distances = []
    k = len(centroids)
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    
    # Calculate the L_p distance from each pixel to each centroid
    for j in range(k): # loop over each centroid
        # Calculate the L_p distance from each pixel to the j-th centroid
        # Using broadcasting to compute the distance for all pixels at once
        dist = np.linalg.norm(X - centroids[j], ord=p, axis=1)
        distances.append(dist)
    # Convert the list of distances to a numpy array
    distances = np.array(distances)

    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return distances

def kmeans(X, k, p ,max_iter=100, epsilon=1e-8):
    """
    Inputs:
    - X: a single image of shape (num_pixels, 3).
    - k: number of centroids.
    - p: the parameter governing the L_p distance measure.
    - max_iter: the maximum number of iterations to perform.
    - epsilon: the threshold for convergence.

    Outputs:
    - The final centroids as a numpy array.
    - The final assignment of all pixels to the closest centroids as a numpy array.
    - The final WCS as a float.
    """
    cluster_assignments = []
    centroids = get_random_centroids(X, k)
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################

    for iteration in range(max_iter):
        distances = l_p_dist_from_centroids(X, centroids, p) # Calculate distances from centroids
        new_assignments = np.argmin(distances, axis=0) # Assign each pixel to the closest centroid

        # Convergence check: if centroids movement is less than epsilon, meaning centroids are not moving significantly
        if iteration > 0 and np.all(np.linalg.norm(old_centroids - centroids, axis=1) < epsilon):
            break

        old_centroids = centroids.copy() # Store the old centroids for next convergence check
        cluster_assignments = new_assignments # Update cluster assignments

        for j in range(k): # Update centroids
            assigned_pixels = X[cluster_assignments == j] # Get all pixels assigned to the j-th centroid
            if len(assigned_pixels) > 0:
                centroids[j] = np.mean(assigned_pixels, axis=0) # Calculate the new centroid as the mean of assigned pixels

        WCS = np.sum(np.min(distances**2, axis=0)) # Calculate the Within Cluster Sum of Squares (WCS)
        
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return centroids, cluster_assignments, WCS

def kmeans_pp(X, k, p ,max_iter=100, epsilon=1e-8):
    """
    The kmeans algorithm with alternative centroid initalization.
    Inputs:
    - X: a single image of shape (num_pixels, 3).
    - k: number of centroids.
    - p: the parameter governing the L_p distance measure.
    - max_iter: the maximum number of iterations to perform.
    - epsilon: the threshold for convergence.

    Outputs:
    - The final centroids as a numpy array.
    - The final assignment of all pixels to the closest centroids as a numpy array.
    - The final WCS as a float.
     """
    cluster_assignments = None
    centroids = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    
    # Initialize the first centroid randomly from the data points
    centroids = np.zeros((k, 3), dtype=float)
    centroids[0] = X[np.random.choice(X.shape[0])].astype(float)
    # Initialize the remaining centroids using the k-means++ algorithm
    for i in range(1, k):
        # Calculate the distance from each pixel to the nearest centroid
        distances_to_existing_centroids = l_p_dist_from_centroids(X, centroids[:i], p)
        min_distances = np.min(distances_to_existing_centroids, axis=0)  # Get the minimum distance for each pixel
        squared_distances = min_distances ** 2 
        probabilities = squared_distances / np.sum(squared_distances)
        
        # Sample the next centroid based on the calculated probabilities
        chosen_index = np.random.choice(X.shape[0], p=probabilities)
        centroids[i] = X[chosen_index].astype(float)
        
    # Now we can proceed with the standard k-means algorithm
    for iteration in range(max_iter):
        distances = l_p_dist_from_centroids(X, centroids, p)  # Calculate distances from centroids
        new_assignments = np.argmin(distances, axis=0)  # Assign each pixel to the closest centroid

        # Convergence check: if centroids movement is less than epsilon
        if iteration > 0 and np.all(np.linalg.norm(old_centroids - centroids, axis=1) < epsilon):
            break

        old_centroids = centroids.copy()  # Store the old centroids for next convergence check
        cluster_assignments = new_assignments  # Update cluster assignments

        for j in range(k):  # Update centroids
            assigned_pixels = X[cluster_assignments == j]  # Get all pixels assigned to the j-th centroid
            if len(assigned_pixels) > 0:
                centroids[j] = np.mean(assigned_pixels, axis=0)  # Calculate the new centroid as the mean of assigned pixels

        WCS = np.sum(np.min(distances**2, axis=0))  # Calculate the Within Cluster Sum of Squares (WCS)

    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return centroids, cluster_assignments, WCS
