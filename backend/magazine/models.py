from django.db import models
from django.contrib.auth.models import User
import os
import uuid  # Add this import

def post_image_path(instance, filename):
    # Simple path without user folders
    return f'posts/{filename}'

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)  # Make optional
    bio = models.TextField(blank=True, null=True)  # Add bio field
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.student_id}"

    def save(self, *args, **kwargs):
        if not self.student_id:
            # Auto-generate student_id if not provided
            self.student_id = f"STU{self.user.id:06d}"
        super().save(*args, **kwargs)

class Post(models.Model):
    POST_TYPES = [
        ('writing', 'Writing'),
        ('art', 'Art'),
        ('photography', 'Photography'),
        ('music', 'Music'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='writing')
    author = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to=post_image_path, null=True, blank=True,max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()
    
    def get_image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'user']

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.user.username} on {self.post.title}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name