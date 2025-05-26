from flask import Flask, render_template, request, jsonify
import sqlite3
import bcrypt


app=Flask(__name__)

def hash_password(plain_text_password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(plain_text_password.encode('utf-8'), salt)
    return hashed_password

def check_password(plain_text_password, hashed_password):
    return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_password)
    

####################################################################################################################################################################################
#Base code
####################################################################################################################################################################################

@app.route('/')
def home(): 
    return render_template('index.html')

####################################################################################################################################################################################
#Create Account
####################################################################################################################################################################################

@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.json
    username = data['username']
    password = data['password']
    email = data['email']

    hashed_password = hash_password(password)

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        sql_query = """
        INSERT INTO user (user_name, user_password, user_email)
        VALUES (?, ?, ?)
        """
        crsr.execute(sql_query, (username, hashed_password, email))
        connection.commit()
        message = {"success": True, "message": "Account created successfully!"}
    except sqlite3.IntegrityError:
        message = {"success": False, "message": "Username or email already exists."}
    finally:
        connection.close()

    return jsonify(message)

####################################################################################################################################################################################
#Login code
####################################################################################################################################################################################

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['data']
    password = data['password']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        crsr.execute("SELECT user_password FROM user WHERE user_name = ?", (username,))
        result = crsr.fetchone()

        if result:
            hashed_password = result[0]
            if check_password(password, hashed_password):
                return jsonify({"success": True, "message": "Login successful!"})
            else:
                print('test')
                return jsonify({"success": False, "message": "Invalid username or password."})
        else:
            print('test2')
            return jsonify({"success": False, "message": "Invalid username or password."})
    finally:
        connection.close()


####################################################################################################################################################################################
#Recipes by meal type code
####################################################################################################################################################################################

@app.route('/recipes', methods=['POST'])
def get_recipes_by_category():
    data = request.json['data']
    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()
    
    sql_query = """
    SELECT r.r_name
    FROM recipe r
    JOIN category_recipe_pair rcp ON rcp.r_idFk = r.r_id
    JOIN category c ON rcp.c_idFk = c.c_id
    WHERE c.c_name = ?
    """
    crsr.execute(sql_query, (data,))
    results = crsr.fetchall()
    recipe_names = [recipe[0] for recipe in results]

    connection.close()
    return jsonify({'data': recipe_names})

####################################################################################################################################################################################
#Search Bar code
####################################################################################################################################################################################

@app.route('/search', methods=['POST'])
def search_recipes():
    print("test")
    data = request.json['data']
    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()
    
    sql_query = """
    SELECT DISTINCT r_name 
    FROM recipe 
    WHERE UPPER(r_name) 
    LIKE UPPER(?)
    """
    crsr.execute(sql_query, ('%' + data + '%',))
    results = crsr.fetchall()
    recipe_names = [recipe[0] for recipe in results]

    connection.close()
    return jsonify({'data': recipe_names})

####################################################################################################################################################################################
#Favorites code
####################################################################################################################################################################################

@app.route('/favorite', methods=['POST'])
def favorite_recipes():
    data = request.json['data']
    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()
    
    sql_query = """
    SELECT DISTINCT r_name 
    FROM recipe r
    JOIN favorite f ON f.r_idFk = r.r_id
    JOIN user u ON u.user_id = f.user_idFk
    WHERE user_name = ?
    """
    crsr.execute(sql_query, (data,))
    results = crsr.fetchall()
    recipe_names = [recipe[0] for recipe in results]
    print(recipe_names)

    connection.close()
    return jsonify({'data': recipe_names})

####################################################################################################################################################################################
#Shopping List code
####################################################################################################################################################################################
@app.route('/favorites-with-ingredients', methods=['POST'])
def favorites_with_ingredients():
    data = request.json['data']  

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()
    sql_query = """
    SELECT r.r_id, r.r_name, i.i_name, i.i_amount
    FROM recipe r
    JOIN favorite f ON f.r_idFk = r.r_id
    JOIN user u ON u.user_id = f.user_idFk
    JOIN ingredients i ON i.r_id = r.r_id
    WHERE u.user_name = ?
    """

    crsr.execute(sql_query, (data,))
    results = crsr.fetchall()

    recipes = {}
    for r_id, r_name, i_name, i_amount in results:
        if r_id not in recipes:
            recipes[r_id] = {
                "name": r_name,
                "ingredients": []
            }
        recipes[r_id]["ingredients"].append({"name": i_name, "amount": i_amount})

    connection.close()
    return jsonify({"data": recipes})

####################################################################################################################################################################################
#Recipe View Code
####################################################################################################################################################################################
@app.route('/recipe-details', methods=['POST'])
def recipe_details():
    data = request.json 
    recipe_name = data['recipe_name']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        sql_query = """
        SELECT r.r_name, r.r_cooking_time, i.i_name, i.i_amount, n.n_protein, n.n_fat, n.n_carb, n.n_calorie
        FROM recipe r
        JOIN ingredients i ON r.r_id = i.r_id
        LEFT JOIN nutrition n ON r.r_id = n.r_id
        WHERE r.r_name = ?
        """
        crsr.execute(sql_query, (recipe_name,))
        results = crsr.fetchall()

        if results:
            recipe_details = {
                "name": results[0][0],
                "cooking_time": results[0][1],
                "ingredients": [{"name": row[2], "amount": row[3]} for row in results],
                "nutrition": {
                    "protein": results[0][4],
                    "fat": results[0][5],
                    "carbs": results[0][6],
                    "calories": results[0][7],
                }
            }
            response = {"success": True, "data": recipe_details}
        else:
            response = {"success": False, "message": "Recipe not found."}
    except Exception as e:
        response = {"success": False, "message": str(e)}
    finally:
        connection.close()

    return jsonify(response)

@app.route('/add-to-favorites', methods=['POST'])
def add_to_favorites():
    data = request.json  
    username = data['username']
    recipe_name = data['recipe_name']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        user_query = "SELECT user_id FROM user WHERE user_name = ?"
        crsr.execute(user_query, (username,))
        user_result = crsr.fetchone()

        recipe_query = "SELECT r_id FROM recipe WHERE r_name = ?"
        crsr.execute(recipe_query, (recipe_name,))
        recipe_result = crsr.fetchone()

        if not user_result or not recipe_result:
            return jsonify({"success": False, "message": "Invalid username or recipe name."})

        user_id = user_result[0]
        recipe_id = recipe_result[0]

        insert_query = """
        INSERT INTO favorite (user_idFk, r_idFk)
        VALUES (?, ?)
        """
        crsr.execute(insert_query, (user_id, recipe_id))
        connection.commit()
        message = {"success": True, "message": "Recipe added to favorites!"}
    except sqlite3.IntegrityError:
        message = {"success": False, "message": "Recipe is already in your favorites."}
    finally:
        connection.close()

    return jsonify(message)

####################################################################################################################################################################################
#Recipe Upload Code
####################################################################################################################################################################################
@app.route('/upload-recipe', methods=['POST'])
def upload_recipe():
    data = request.json 
    recipe_name = data['recipe_name']
    cooking_time = data.get('cooking_time')  
    ingredients = data.get('ingredients', [])  
    nutrition = data.get('nutrition', {})  
    username = data['username']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        user_query = "SELECT user_id FROM user WHERE user_name = ?"
        crsr.execute(user_query, (username,))
        user_result = crsr.fetchone()
        user_id = user_result[0]

        if not user_result:
            return jsonify({"success": False, "message": "Invalid username."})

        recipe_query = """
        INSERT INTO recipe (r_name, r_cooking_time, user_id)
        VALUES (?, ?, ?)
        """
        crsr.execute(recipe_query, (recipe_name, cooking_time, user_id))
        recipe_id = crsr.lastrowid  

        ingredient_query = """
        INSERT INTO ingredients (r_id, i_name, i_amount)
        VALUES (?, ?, ?)
        """
        for ingredient in ingredients:
            crsr.execute(ingredient_query, (recipe_id, ingredient['name'], ingredient['amount']))

        if nutrition:
            nutrition_query = """
            INSERT INTO nutrition (r_id, n_protein, n_fat, n_carb, n_calorie)
            VALUES (?, ?, ?, ?, ?)
            """
            crsr.execute(nutrition_query, (
                recipe_id,
                nutrition.get('protein'),
                nutrition.get('fat'),
                nutrition.get('carbs'),
                nutrition.get('calories')
            ))

        connection.commit()
        response = {"success": True, "message": "Recipe uploaded successfully!"}
    except Exception as e:
        connection.rollback()
        response = {"success": False, "message": str(e)}
    finally:
        connection.close()

    return jsonify(response)

####################################################################################################################################################################################
#Comment Upload Code
####################################################################################################################################################################################
@app.route('/get-comments', methods=['POST'])
def get_comments():
    data = request.json  
    recipe_name = data['recipe_name']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    sql_query = """
    SELECT c.comm_text, c.comm_rating, u.user_name
    FROM comments c
    JOIN recipe r ON c.r_id = r.r_id
    JOIN user u ON c.user_id = u.user_id
    WHERE r.r_name = ?
    """
    crsr.execute(sql_query, (recipe_name,))
    results = crsr.fetchall()

    comments = [
        {"text": row[0], "rating": row[1], "user": row[2]}
        for row in results
    ]

    connection.close()
    return jsonify({"success": True, "comments": comments})

@app.route('/create-comment', methods=['POST'])
def create_comment():
    data = request.json  
    recipe_name = data['recipe_name']
    username = data['username']
    rating = data['rating']
    comment_text = data['text']

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    try:
        recipe_query = "SELECT r_id FROM recipe WHERE r_name = ?"
        crsr.execute(recipe_query, (recipe_name,))
        recipe_result = crsr.fetchone()

        user_query = "SELECT user_id FROM user WHERE user_name = ?"
        crsr.execute(user_query, (username,))
        user_result = crsr.fetchone()

        if not recipe_result or not user_result:
            return jsonify({"success": False, "message": "Invalid recipe name or username."})

        recipe_id = recipe_result[0]
        user_id = user_result[0]

        comment_query = """
        INSERT INTO comments (r_id, user_id, comm_text, comm_rating)
        VALUES (?, ?, ?, ?)
        """
        crsr.execute(comment_query, (recipe_id, user_id, comment_text, rating))
        connection.commit()

        response = {"success": True, "message": "Comment added successfully!"}
    except Exception as e:
        connection.rollback()
        response = {"success": False, "message": str(e)}
    finally:
        connection.close()

    return jsonify(response)

####################################################################################################################################################################################
#Nutrition Search Code
####################################################################################################################################################################################

@app.route('/search-nutrition', methods=['POST'])
def search_by_nutrition():
    data = request.json 
    min_protein = data.get('min_protein', 0)
    max_protein = data.get('max_protein', float('inf'))
    min_fat = data.get('min_fat', 0)
    max_fat = data.get('max_fat', float('inf'))
    min_carbs = data.get('min_carbs', 0)
    max_carbs = data.get('max_carbs', float('inf'))
    min_calories = data.get('min_calories', 0)
    max_calories = data.get('max_calories', float('inf'))

    connection = sqlite3.connect("cookbook_dtb.db")
    crsr = connection.cursor()

    sql_query = """
    SELECT r.r_name, n.n_protein, n.n_fat, n.n_carb, n.n_calorie
    FROM recipe r
    JOIN nutrition n ON r.r_id = n.r_id
    WHERE n.n_protein BETWEEN ? AND ?
      AND n.n_fat BETWEEN ? AND ?
      AND n.n_carb BETWEEN ? AND ?
      AND n.n_calorie BETWEEN ? AND ?
    """
    crsr.execute(sql_query, (min_protein, max_protein, min_fat, max_fat, 
                             min_carbs, max_carbs, min_calories, max_calories))
    results = crsr.fetchall()
    connection.close()

    recipes = [{"name": row[0], "protein": row[1], "fat": row[2], 
                "carbs": row[3], "calories": row[4]} for row in results]

    return jsonify({"data": recipes})


####################################################################################################################################################################################
#More base code
####################################################################################################################################################################################

if __name__=='__main__':
    app.run() 