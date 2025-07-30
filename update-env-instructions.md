# 🔧 Update Your .env File

## 🎯 **Step 2: Update MongoDB Connection String**

You need to update your `.env` file with your MongoDB Atlas connection string.

### **What to Change:**

**Find this line in your `.env` file:**
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/digital-wholesale-catalogue
```

**Replace it with:**
```bash
MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority
```

### **Important Notes:**
- ✅ **Username**: `melmoussallem`
- ✅ **Password**: `aQI5qbL23FKti3cV`
- ✅ **Cluster**: `cluster0.gjbkrwp.mongodb.net`
- ✅ **Database**: `digital-wholesale-catalogue` (added to the end)
- ✅ **Parameters**: `?retryWrites=true&w=majority` (for reliability)

### **How to Update:**

1. **Open your `.env` file** in a text editor
2. **Find the MONGODB_URI line**
3. **Replace the entire line** with the new connection string above
4. **Save the file**

### **After Updating:**

Once you've updated the `.env` file, we'll test the connection with:
```bash
node test-database-connection.js
```

**Let me know when you've updated the `.env` file!** 🚀 