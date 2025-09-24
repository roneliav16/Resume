import numpy as np
import matplotlib.pyplot as plt

### Chi square table values ###
# The first key is the degree of freedom 
# The second key is the p-value cut-off
# The values are the chi-statistic that you need to use in the pruning

chi_table = {1: {0.5 : 0.45,
             0.25 : 1.32,
             0.1 : 2.71,
             0.05 : 3.84,
             0.0001 : 100000},
         2: {0.5 : 1.39,
             0.25 : 2.77,
             0.1 : 4.60,
             0.05 : 5.99,
             0.0001 : 100000},
         3: {0.5 : 2.37,
             0.25 : 4.11,
             0.1 : 6.25,
             0.05 : 7.82,
             0.0001 : 100000},
         4: {0.5 : 3.36,
             0.25 : 5.38,
             0.1 : 7.78,
             0.05 : 9.49,
             0.0001 : 100000},
         5: {0.5 : 4.35,
             0.25 : 6.63,
             0.1 : 9.24,
             0.05 : 11.07,
             0.0001 : 100000},
         6: {0.5 : 5.35,
             0.25 : 7.84,
             0.1 : 10.64,
             0.05 : 12.59,
             0.0001 : 100000},
         7: {0.5 : 6.35,
             0.25 : 9.04,
             0.1 : 12.01,
             0.05 : 14.07,
             0.0001 : 100000},
         8: {0.5 : 7.34,
             0.25 : 10.22,
             0.1 : 13.36,
             0.05 : 15.51,
             0.0001 : 100000},
         9: {0.5 : 8.34,
             0.25 : 11.39,
             0.1 : 14.68,
             0.05 : 16.92,
             0.0001 : 100000},
         10: {0.5 : 9.34,
              0.25 : 12.55,
              0.1 : 15.99,
              0.05 : 18.31,
              0.0001 : 100000},
         11: {0.5 : 10.34,
              0.25 : 13.7,
              0.1 : 17.27,
              0.05 : 19.68,
              0.0001 : 100000}}

def calc_gini(data):
    """
    Calculate gini impurity measure of a dataset.
 
    Input:
    - data: any dataset where the last column holds the labels.
 
    Returns:
    - gini: The gini impurity value.
    """
    gini = 0.0
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################

    _, counts = np.unique(data[:, -1], return_counts=True)
    counts = counts.astype(int).tolist()
    total_sampels = data.shape[0]

    gini = 1
    
    for i in range(len(counts)):
        gini -= (counts[i] / total_sampels) ** 2
        
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return gini

def calc_entropy(data):
    """
    Calculate the entropy of a dataset.

    Input:
    - data: any dataset where the last column holds the labels.

    Returns:
    - entropy: The entropy value.
    """
    entropy = 0.0
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    
    _, counts = np.unique(data[:, -1], return_counts=True)
    counts = counts.astype(int).tolist()
    total_sampels = data.shape[0]
    
    for i in range(len(counts)):
        pj = counts[i] / total_sampels
        entropy += pj * float(np.log2(pj))
        
    entropy = - entropy 
    
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return entropy

class DecisionNode:

    
    def __init__(self, data, impurity_func, feature=-1,depth=0, chi=1, max_depth=1000, gain_ratio=False):
        
        self.data = data # the data instances associated with the node
        self.terminal = False # True iff node is a leaf
        self.feature = feature # column index of feature/attribute used for splitting the node
        self.pred = self.calc_node_pred() # the class prediction associated with the node
        self.depth = depth # the depth of the node
        self.children = [] # the children of the node (array of DecisionNode objects)
        self.children_values = [] # the value associated with each child for the feature used for splitting the node
        self.max_depth = max_depth # the maximum allowed depth of the tree
        self.chi = chi # the P-value cutoff used for chi square pruning
        self.impurity_func = impurity_func # the impurity function to use for measuring goodness of a split
        self.gain_ratio = gain_ratio # True iff GainRatio is used to score features
        self.feature_importance = 0
    
    def calc_node_pred(self):
        """
        Calculate the node's prediction.

        Returns:
        - pred: the prediction of the node
        """
        pred = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        class_labels, counts = np.unique(self.data[:, -1], return_counts=True) # we'll check which class label is more frequent
        counts = counts.astype(int).tolist()
        if len(counts) == 1:
            pred = class_labels[0]
        else:
            pred = class_labels[counts.index(max(counts))] # get the index of the maximum count
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return pred
        
    def add_child(self, node, val):
        """
        Adds a child node to self.children and updates self.children_values

        This function has no return value
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        self.children.append(node)
        self.children_values.append(val)
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
    
    def goodness_of_split(self, feature):
        """
        Calculate the goodness of split of a dataset given a feature and impurity function.

        Input:
        - feature: the feature index the split is being evaluated according to.

        Returns:
        - goodness: the goodness of split
        - groups: a dictionary holding the data after splitting 
                  according to the feature values.
        """
        goodness = 0
        groups = {} # groups[feature_value] = data_subset
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        total_samples = self.data.shape[0]
        selected_impurity_func = calc_entropy if self.gain_ratio is True else self.impurity_func

        phi_s = selected_impurity_func(self.data)
        
        values, counts = np.unique(self.data[:, feature], return_counts=True)
        if len(values) == 1:
            goodness = 0
        else:
            counts = counts.astype(int).tolist()
            
            sum_phi_values = 0
            for i in range(len(counts)):
                sum_phi_values += (counts[i] / total_samples) * selected_impurity_func(self.data[self.data[:, feature] == values[i]])

            goodness = (phi_s - sum_phi_values) / selected_impurity_func(self.data[:, [feature]]) if self.gain_ratio else phi_s - sum_phi_values
            
        for value in values:
            groups[value] = self.data[self.data[:, feature] == value]
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return goodness, groups
        
    def calc_feature_importance(self, n_total_sample):
        """
        Calculate the selected feature importance.
        
        Input:
        - n_total_sample: the number of samples in the dataset.

        This function has no return value - it stores the feature importance in 
        self.feature_importance
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        self.feature_importance = (self.data.shape[0] / n_total_sample) * self.goodness_of_split(self.feature)[0]
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
    
    def split(self):
        """
        Splits the current node according to the self.impurity_func. This function finds
        the best feature to split according to and create the corresponding children.
        This function should support pruning according to self.chi and self.max_depth.

        This function has no return value
        """
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        if self.depth is self.max_depth: # check for max depth or failure of chi test (RECHECK LATER)
            self.terminal = True
            return
        
        best_gos = -1 # initialize best goodness of split
        current_gos = 0
        best_feature = None
        current_values_data = None
        for i in range(self.data.shape[1] - 2): # get all columns except last one (which is the label column)
            current_gos, _ = self.goodness_of_split(i)
            if current_gos > best_gos:
                best_gos = current_gos
                best_feature = i # assign the index of the feature

        if best_feature is None or best_gos == 0: # check if the best feature is None
            self.terminal = True
            return
        
        values = np.unique(self.data[:, best_feature])
        current_values_data = self.data[:, best_feature] # stores the column of the best feature

        if self.chi != 1: # check if the chi value is not equal to 1
            class_labels = np.unique(self.data[:, -1])
            chi_squared_test = 0
            for value in values:
                data_s_v = self.data[self.data[:, best_feature] == value] # get the data subset with feature value v
                for j in class_labels:
                    s_v_j = data_s_v[:, -1].tolist().count(j) # count the number of samples with class label j and feature value v
                    p_j = self.data[self.data[:, -1] == j].shape[0] / self.data.shape[0] # calculate the probability of class label j
                    chi_squared_test += (s_v_j - (data_s_v.shape[0] * p_j)) ** 2 / (data_s_v.shape[0] * p_j) # calculate the chi value
            

            # check if the chi value is less than the chi table value
            if chi_squared_test < chi_table[(len(class_labels) - 1) * (len(values) - 1)][self.chi]:
                self.terminal = True
                return
        
        self.feature = best_feature
        
        if len(values) == 1: # check if the feature has only one value
            self.terminal = True
            return
        
        for value in values:
            node = DecisionNode(self.data[current_values_data == value], self.impurity_func, depth=self.depth + 1, max_depth=self.max_depth, chi=self.chi, gain_ratio=self.gain_ratio) # we create a new node
            self.add_child(node, value)     
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################

                    
class DecisionTree:
    def __init__(self, data, impurity_func, feature=-1, chi=1, max_depth=1000, gain_ratio=False):
        self.data = data # the training data used to construct the tree
        self.root = None # the root node of the tree
        self.max_depth = max_depth # the maximum allowed depth of the tree
        self.chi = chi # the P-value cutoff used for chi square pruning
        self.impurity_func = impurity_func # the impurity function to be used in the tree
        self.gain_ratio = gain_ratio #
        self.height = 0 # the height of the tree
        
    def depth(self):
        return self.root.depth

    def build_tree(self):
        """
        Build a tree using the given impurity measure and training dataset. 
        You are required to fully grow the tree until all leaves are pure 
        or the goodness of split is 0.

        This function has no return value
        """
        self.root = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        self.root = DecisionNode(self.data, self.impurity_func, depth=0, chi=self.chi, max_depth=self.max_depth, gain_ratio=self.gain_ratio)
        
        def _build(node):
            if self.height < node.depth: # use the depth field of the root node as the height of the tree
                self.height = node.depth

            # Stopping condition:
            if node.depth == self.root.max_depth or len(set(node.data[:, -1])) == 1:
                node.terminal = True
                return
            
            # Find the best split:
            node.split()
            
            
            node.calc_feature_importance(self.data.shape[0]) # calculate the feature importance
        
            # Recurse on each child:
            for child in node.children:
                _build(child)
    
        _build(self.root)
        
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################

    def predict(self, instance):
        """
        Predict a given instance
     
        Input:
        - instance: an row vector from the dataset. Note that the last element 
                    of this vector is the label of the instance.
     
        Output: the prediction of the instance.
        """
        pred = None
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        node = self.root # start from the root node
        # traverse the tree until we reach a terminal node
        while not node.terminal: # check if the node is terminal
            feature_value = instance[node.feature] # get the feature value of the instance
            if feature_value in node.children_values: # check if the feature value is not in the children values
                index = node.children_values.index(feature_value) # get the index of the child node corresponding to the feature value
                node = node.children[index] # move to the child node
            else:
                break

        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return node.pred

    def calc_accuracy(self, dataset):
        """
        Predict a given dataset 
     
        Input:
        - dataset: the dataset on which the accuracy is evaluated
     
        Output: the accuracy of the decision tree on the given dataset (%).
        """
        accuracy = 0
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        correct = 0
        total_samples = dataset.shape[0]
        for i in range(total_samples):
            pred = self.predict(dataset[i])
            if pred == dataset[i, -1]: # check if the prediction is correct
                correct += 1
        accuracy = (correct / total_samples) * 100 # calculate the accuracy
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
        return accuracy
        

def depth_pruning(X_train, X_validation):
    """
    Calculate the training and validation accuracies for different depths
    using the best impurity function and the gain_ratio flag you got
    previously. 

    Input:
    - X_train: the training data where the last column holds the labels
    - X_validation: the validation data where the last column holds the labels
 
    Output: the training and validation accuracies per max depth
    """
    training = []
    validation  = []
    root = None
    for max_depth in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
        ###########################################################################
        # TODO: Implement the function.                                           #
        ###########################################################################
        
        root = DecisionTree(X_train, impurity_func=calc_entropy, max_depth=max_depth, gain_ratio=True) # create a new decision tree
        root.build_tree() # build the tree
        training.append(root.calc_accuracy(X_train)) # calculate the training accuracy
        validation.append(root.calc_accuracy(X_validation)) # calculate the validation accuracy

    
        ###########################################################################
        #                             END OF YOUR CODE                            #
        ###########################################################################
    return training, validation


def chi_pruning(X_train, X_test):

    """
    Calculate the training and validation accuracies for different chi values
    using the best impurity function and the gain_ratio flag you got
    previously. 

    Input:
    - X_train: the training data where the last column holds the labels
    - X_validation: the validation data where the last column holds the labels
 
    Output:
    - chi_training_acc: the training accuracy per chi value
    - chi_validation_acc: the validation accuracy per chi value
    - depth: the tree depth for each chi value
    """
    chi_training_acc = []
    chi_validation_acc  = []
    depth = []

    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################

    p_value_range = [1, 0.5, 0.25, 0.1, 0.05, 0.0001]
    for p_value in p_value_range:
        # create a new decision tree
        root = DecisionTree(X_train, impurity_func=calc_entropy, chi=p_value, gain_ratio=True)
        root.build_tree()
        chi_training_acc.append(root.calc_accuracy(X_train)) # calculate the training accuracy
        chi_validation_acc.append(root.calc_accuracy(X_test)) # calculate the validation accuracy
        depth.append(root.height) # get the height of the tree (same as depth)

    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
        
    return chi_training_acc, chi_validation_acc, depth


def count_nodes(node):
    """
    Count the number of node in a given tree
 
    Input:
    - node: a node in the decision tree.
 
    Output: the number of node in the tree.
    """
    ###########################################################################
    # TODO: Implement the function.                                           #
    ###########################################################################
    n_nodes = 1 
    for child in node.children: # iterate over the children of the node
        n_nodes += count_nodes(child) # recursively count the number of nodes in the child
    ###########################################################################
    #                             END OF YOUR CODE                            #
    ###########################################################################
    return n_nodes
