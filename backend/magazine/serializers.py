from rest_framework import serializers
from .models import StudentProfile, Post, Like, Comment, Category

class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'username', 'email', 'student_id', 'bio', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.user.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'post_type', 'author', 'author_name', 
            'image', 'created_at', 'updated_at', 'likes_count', 'comments_count'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add full URL for image
        if instance.image:
            request = self.context.get('request')
            if request is not None:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                representation['image'] = instance.image.url
        else:
            representation['image'] = None
        return representation

    def create(self, validated_data):
        print("🔄 PostSerializer create method called")
        print("📝 Validated data:", validated_data)
        print("🖼️ Image in validated_data:", 'image' in validated_data)
        
        # Handle image separately to ensure it's processed
        image_file = validated_data.pop('image', None)
        post = Post.objects.create(**validated_data)
        
        if image_file:
            print("✅ Processing image file:", image_file.name)
            post.image = image_file
            post.save()
            print("🖼️ Image saved to post")
        else:
            print("❌ No image file to process")
            
        return post

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_name', 'content', 'created_at']
        read_only_fields = ['author', 'author_name', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']