from django.contrib import admin
from .models import StudentProfile, Post, Like, Comment, Category

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'is_verified')
    list_filter = ('is_verified',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'post_type', 'created_at')
    list_filter = ('post_type', 'created_at')

admin.site.register(Category)
admin.site.register(Like)
admin.site.register(Comment)