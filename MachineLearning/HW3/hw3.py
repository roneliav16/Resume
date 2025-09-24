import numpy as np
from typing import Union
import math

def poisson_log_pmf(k: Union[int, np.ndarray], rate: float) -> Union[float, np.ndarray]:
    """
    k: A discrete instance or an array of discrete instances
    rate: poisson rate parameter (lambda)

    return the log pmf value for instances k given the rate
    """

    log_p = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    if isinstance(k, int):
        log_p = k * np.log(rate) - rate - np.log(math.factorial(k))
    else:
        log_p = np.zeros_like(k, dtype=float)
        for i, ki in enumerate(k):
            log_p[i] = ki * np.log(rate) - rate - np.log(math.factorial(ki))
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return log_p


def possion_analytic_mle(samples):
    """
    samples: set of univariate discrete observations

    return: the rate that maximizes the likelihood
    """
    mean = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    mean = np.mean(samples)
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return mean

def possion_confidence_interval(lambda_mle, n, alpha=0.05):
    """
    lambda_mle: an MLE for the rate parameter (lambda) in a Poisson distribution
    n: the number of samples used to estimate lambda_mle
    alpha: the significance level for the confidence interval (typically small value like 0.05)
 
    return: a tuple (lower_bound, upper_bound) representing the confidence interval
    """
    # Use norm.ppf to compute the inverse of the normal CDF
    from scipy.stats import norm
    lower_bound = None
    upper_bound = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    z = norm.ppf(1 - alpha / 2)  # z-score for the two-tailed test
    sqrt_lambda_mle_n_mult_z = z * np.sqrt(lambda_mle / n)
    lower_bound = lambda_mle - sqrt_lambda_mle_n_mult_z
    upper_bound = lambda_mle + sqrt_lambda_mle_n_mult_z
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return lower_bound, upper_bound

def get_poisson_log_likelihoods(samples, rates):
    """
    samples: set of univariate discrete observations
    rates: an iterable of rates to calculate log-likelihood by.

    return: 1d numpy array, where each value represent that log-likelihood value of rates[i]
    """
    likelihoods = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    likelihoods = np.zeros(len(rates))
    for i, rate in enumerate(rates):
        likelihoods[i] = np.sum(poisson_log_pmf(samples, rate))
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return likelihoods

class conditional_independence():

    def __init__(self):

        # You need to fill the None value with *valid* probabilities
        self.X = {0: 0.3, 1: 0.7}  # P(X=x)
        self.Y = {0: 0.3, 1: 0.7}  # P(Y=y)
        self.C = {0: 0.5, 1: 0.5}  # P(C=c)

        self.X_Y = {
            (0, 0): 0.1,
            (0, 1): 0.2,
            (1, 0): 0.2,
            (1, 1): 0.5
        }  # P(X=x, Y=y)

        self.X_C = {
            (0, 0): 0.0,
            (0, 1): 0.3,
            (1, 0): 0.5,
            (1, 1): 0.2
        }  # P(X=x, C=c)

        self.Y_C = {
            (0, 0): 0.3,
            (0, 1): 0.0,
            (1, 0): 0.2,
            (1, 1): 0.5
        }  # P(Y=y, C=c)

        self.X_Y_C = {
            (0, 0, 0): 0.0,
            (0, 0, 1): 0.0,
            (0, 1, 0): 0.0,
            (0, 1, 1): 0.3,
            (1, 0, 0): 0.3,
            (1, 0, 1): 0.0,
            (1, 1, 0): 0.2,
            (1, 1, 1): 0.2,
        }  # P(X=x, Y=y, C=c)

    def is_X_Y_dependent(self):
        """
        return True iff X and Y are depndendent
        """
        X = self.X
        Y = self.Y
        X_Y = self.X_Y
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        # Check if P(X=x, Y=y) = P(X=x) * P(Y=y)
        for x in X:
            for y in Y:
                if X_Y[(x, y)] != X[x] * Y[y]:
                    return True
        return False
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################

    def is_X_Y_given_C_independent(self):
        """
        return True iff X_given_C and Y_given_C are indepndendent
        """
        X = self.X
        Y = self.Y
        C = self.C
        X_C = self.X_C
        Y_C = self.Y_C
        X_Y_C = self.X_Y_C
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        # Check if P(X=x, Y=y | C=c) = P(X=x | C=c) * P(Y=y | C=c)
        for x in X:
            for y in Y:
                for c in C:
                    if X_Y_C[(x, y, c)] != (X_C[(x, c)] * Y_C[(y, c)]) / C[c]:
                        return False
        return True
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################


def normal_pdf(x, mean, std):
    """
    Calculate normal desnity function for a given x, mean and standrad deviation.
 
    Input:
    - x: A value we want to compute the distribution for.
    - mean: The mean value of the distribution.
    - std:  The standard deviation of the distribution.
 
    Returns the normal distribution pdf according to the given mean and std for the given x.    
    """
    p = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    p = (1 / (std * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mean) / std) ** 2)
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return p

class NaiveNormalClassDistribution():
    def __init__(self, dataset, class_value):
        """
        A class which encapsulates information on the feature-specific
        class conditional distributions for a given class label.
        Each of these distributions is a univariate normal distribution with
        separate parameters (mean and std).
        These distributions are fit to specified training data.
        
        Input
        - dataset: The training dataset as a 2d numpy array, assuming the class label is the last column
        - class_value : The class label to calculate the class conditionals for.
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        self.class_value = class_value
        self.dataset = dataset[dataset[:, -1] == class_value]
        self.feature_means = np.mean(self.dataset[:, :-1], axis=0) # Exclude class label column
        self.feature_stds = np.std(self.dataset[:, :-1], axis=0, ddof=1) # Use ddof=1 for sample standard deviation
        self.prior = len(self.dataset) / len(dataset)
        self.feature_count = self.dataset.shape[1] - 1  # Exclude class label column
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
    
    def get_prior(self):
        """
        Returns the prior porbability of the class, as computed from the training data.
        """
        prior = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        prior = self.prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return prior
    
    def get_instance_likelihood(self, x):
        """
        Returns the likelihood of the instance given the class label according to
        the feature-specific classc conditionals fitted to the training data.
        """
        likelihood = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = 1.0
        for i in range(self.feature_count):
            mean = self.feature_means[i]
            std = self.feature_stds[i]
            likelihood *= normal_pdf(x[i], mean, std)
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return likelihood
    
    def get_instance_joint_prob(self, x):
        """
        Returns the joint probability of the input instance (x) and the class label.
        """
        joint_prob = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = self.get_instance_likelihood(x)
        prior = self.get_prior()
        joint_prob = likelihood * prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return joint_prob

class MAPClassifier():
    def __init__(self, ccd0 , ccd1):
        """
        A Maximum a posteriori classifier. 
        This class holds a ClassDistribution object (either NaiveNormal or MultiNormal)
        for each of the two class labels (0 and 1). 
        Using these objects it predicts class labels for input instances using the MAP rule.
    
        Input
            - ccd0 : A ClassDistribution object for class label 0.
            - ccd1 : A ClassDistribution object for class label 1.
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        self.ccd0 = ccd0
        self.ccd1 = ccd1
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################

    def predict(self, x):
        """
        Predicts the instance class using the 2 distribution objects given in the object constructor.
    
        Input
            - An instance to predict.
        Output
            - 0 if the posterior probability of class 0 is higher and 1 otherwise.
        """
        pred = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        joint_prob_0 = self.ccd0.get_instance_joint_prob(x)
        joint_prob_1 = self.ccd1.get_instance_joint_prob(x)
        if joint_prob_0 > joint_prob_1:
            pred = 0
        else:
            pred = 1
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return pred

    
def multi_normal_pdf(x, mean, cov):
    """
    Calculate multivariate normal desnity function under specified mean vector
    and covariance matrix for a given x.
 
    Input:
    - x: A value we want to compute the distribution for.
    - mean: The mean vector of the distribution.
    - cov:  The covariance matrix of the distribution.
 
    Returns the normal distribution pdf according to the given mean and var for the given x.    
    """
    pdf = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    d = len(mean)
    diff = x - mean
    cov_inv = np.linalg.inv(cov)
    exponent = -0.5 * np.dot(np.dot(diff.T, cov_inv), diff)
    normalization = (2 * np.pi) ** (d / 2) * np.linalg.det(cov) ** 0.5
    pdf = np.exp(exponent) / normalization
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return pdf

class MultiNormalClassDistribution():

    def __init__(self, dataset, class_value):
        """
        A class which encapsulate the multivariate normal distribution
        representing the class conditional distribution for a given class label.
        The mean and cov matrix should be computed from a given training data set
        (You can use the numpy function np.cov to compute the sample covarianve matrix).
        
        Input
        - dataset: The dataset as a numpy array
        - class_value : The class label to calculate the parameters for.
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        self.class_value = class_value
        self.dataset = dataset[dataset[:, -1] == class_value]
        self.mean = np.mean(self.dataset[:, :-1], axis=0)  # Exclude class label column
        self.cov = np.cov(self.dataset[:, :-1], rowvar=False)  # Exclude class label column
        self.prior = len(self.dataset) / len(dataset)
        self.feature_count = self.dataset.shape[1] - 1  # Exclude class label column
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        
    def get_prior(self):
        """
        Returns the prior porbability of the class, as computed from the training data.
        """
        prior = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        prior = self.prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return prior
    
    def get_instance_likelihood(self, x):
        """
        Returns the likelihood of the instance given the class label according to
        the multivariate classc conditionals fitted to the training data.
        """
        likelihood = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = multi_normal_pdf(x, self.mean, self.cov)
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return likelihood
    
    def get_instance_joint_prob(self, x):
        """
        Returns the joint probability of the input instance (x) and the class label.
        """
        joint_prob = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = self.get_instance_likelihood(x)
        prior = self.get_prior()
        joint_prob = likelihood * prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return joint_prob



def compute_accuracy(test_set, map_classifier):
    """
    Compute the accuracy of a given MAP classifier on a given test set.
    
    Input
        - test_set: The test data (Numpy array) on which to compute the accuracy. The class label is the last column
        - map_classifier : A MAPClassifier object that predicits the class label from a feature vector.
        
    Ouput
        - Accuracy = #Correctly Classified / number of test samples
    """
    acc = None
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    correct_predictions = 0
    for i in range(test_set.shape[0]):
        x = test_set[i, :-1]
        true_label = test_set[i, -1]
        predicted_label = map_classifier.predict(x)
        if predicted_label == true_label:
            correct_predictions += 1
    acc = correct_predictions / test_set.shape[0] if test_set.shape[0] > 0 else 0.0
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return acc

class DiscreteNBClassDistribution():
    def __init__(self, dataset, class_value):
        """
        A class which encapsulate the probabilites for a discrete naive bayes
        class conditional distribution for a given class label.
        The probabilites of each feature-specific class conditional
        are computed with laplace smoothing.
        
        Input
        - dataset: The dataset as a numpy array
        - class_value : The class label to calculate the probabilities for.
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        self.class_value = class_value
        self.dataset = dataset[dataset[:, -1] == class_value]
        self.feature_count = self.dataset.shape[1] - 1  # Exclude class label column
        self.feature_values = [np.unique(self.dataset[:, i]) for i in range(self.feature_count)]

        self.feature_probabilities = [{} for _ in range(self.feature_count)]
        total_count = len(self.dataset)
        for i in range(self.feature_count):
            for value in self.feature_values[i]:
                count = np.sum(self.dataset[:, i] == value)
                # Laplace smoothing
                self.feature_probabilities[i][value] = (count + 1) / (total_count + len(self.feature_values[i]))
        self.prior = len(self.dataset) / len(dataset)  # Prior probability of the class
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
    
    def get_prior(self):
        """
        Returns the prior porbability of the class, as computed from the training data.
        """
        prior = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        prior = self.prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return prior
    
    def get_instance_likelihood(self, x):
        """
        Returns the likelihood of the instance given the class label according to
        the product of feature-specific discrete class conidtionals fitted to the training data.
        """
        likelihood = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = 1.0
        for i in range(self.feature_count):
            value = x[i]
            if value in self.feature_probabilities[i]:
                likelihood *= self.feature_probabilities[i][value]
            else:
                # If the value is not seen in training data, we can assume a very small probability
                likelihood *= 1 / (len(self.dataset) + len(self.feature_values[i]))
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return likelihood
    
    def get_instance_joint_prob(self, x):
        """
        Returns the joint probability of the input instance (x) and the class label.
        """
        joint_prob = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        likelihood = self.get_instance_likelihood(x)
        prior = self.get_prior()
        joint_prob = likelihood * prior
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return joint_prob
