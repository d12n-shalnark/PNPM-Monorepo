'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Create a new post
 */
export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const status = (formData.get('status') as string) || 'draft'

  if (!title) {
    return { error: 'Title is required' }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      content,
      status,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/posts')
  
  return { success: true, post: data }
}

/**
 * Update an existing post
 */
export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const status = formData.get('status') as string

  const updates = {
    title,
    content,
    status,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .eq('user_id', user.id) // Ensure user owns the post
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)

  return { success: true, post: data }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id) // Ensure user owns the post

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/posts')

  return { success: true }
}

/**
 * Publish a post (change status to published)
 */
export async function publishPost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)

  return { success: true }
}

/**
 * Unpublish a post (change status to draft)
 */
export async function unpublishPost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)

  return { success: true }
}

/**
 * Get posts (public - only published posts)
 */
export async function getPublishedPosts(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { posts: [], error: error.message }
  }

  return { posts: data }
}

/**
 * Get user's posts (all statuses)
 */
export async function getUserPosts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { posts: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { posts: [], error: error.message }
  }

  return { posts: data }
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('id', postId)
    .single()

  if (error) {
    return { post: null, error: error.message }
  }

  return { post: data }
}
